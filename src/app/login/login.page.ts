import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email = '';
  constructor(
    private readonly supabase: SupabaseService,
  ) {}

  ngOnInit() {}
  async handleLogin(event: any) {
    event.preventDefault();
    const loader = await this.supabase.createLoader();
    await loader.present();
    try {
      await this.supabase.signIn(this.email);
      await loader.dismiss();
      await this.supabase.createNotice('Check your email for the login link!');
    } catch (error) {
      await loader.dismiss();
      await this.supabase.createNotice(error.error_description || error.message)
    }
  }
}
