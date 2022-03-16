import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupabaseService } from '../supabase.service';
import { Camera, CameraResultType } from '@capacitor/camera';
@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {
  _avatarUrl: SafeResourceUrl | undefined;
  uploading = false;

  @Input()
  set avatarUrl(url: string | undefined) {
    if (url) {
      this.downloadImage(url);
    }
  }

  @Output() upload = new EventEmitter<string>();

  constructor(
    private readonly supabase: SupabaseService,
    private readonly dom: DomSanitizer
  ) {}

  ngOnInit() {}

  async downloadImage(path: string) {
    try {
      const { data } = await this.supabase.downLoadImage(path);
      this._avatarUrl = this.dom.bypassSecurityTrustResourceUrl(
        URL.createObjectURL(data)
      );
    } catch (error) {
      console.error('Error downloading image: ', error.message);
    }
  }

  async uploadAvatar() {
    const loader = await this.supabase.createLoader();
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
      });

      const file = await fetch(photo.dataUrl)
        .then((res) => res.blob())
        .then( (blob) => new File([blob], 'my-file', { type: `image/${photo.format}` }));

      const fileName = `${Math.random()}-${new Date().getTime()}.${ photo.format }`;

      await loader.present();
      await this.supabase.uploadAvatar(fileName, file);

      this.upload.emit(fileName);
    } catch (error) {
      this.supabase.createNotice(error.message);
    } finally {
      loader.dismiss();
    }
  }
}
