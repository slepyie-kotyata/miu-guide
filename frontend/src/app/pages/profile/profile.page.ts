import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {IonContent, IonIcon, IonSkeletonText, NavController} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {chevronForwardOutline} from 'ionicons/icons';
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {User} from "../../models/user.model";
import {firstValueFrom} from "rxjs";

@Component({
  selector: 'app-page-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  imports: [IonContent, IonIcon, IonSkeletonText],
})
export class ProfilePage implements OnInit {
  isLoading = signal<boolean>(true);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);

  private readonly emptyUser: User = {
    full_name: "",
    group_name: "",
    group_id: -1,
    major: "",
    specialization: "",
    course: -1,
    institution: ""
  };

  user = computed<User>(() => this.userService.userSignal() ?? this.emptyUser);

  constructor() {
    addIcons({chevronForwardOutline});
  }

  async ngOnInit() {
    this.isLoading.set(true);
    const u = await firstValueFrom(this.userService.loadUser());
    if (!u) {
      this.authService.logout();
      this.userService.clearUser();
      await this.navCtrl.navigateRoot('/login');
      return;
    }

    await firstValueFrom(this.userService.loadUserSubjects());

    this.isLoading.set(false);
  }

  getMajorCode(): string {
    const major = this.user().major;
    if (!major) return '';
    const match = major.match(/^\s*(\S+)/);
    return match ? match[1] : '';
  }

  openMajorDetails() {
    console.log("Открытие деталей специальности:", this.user().major);
  }

  openSubjectsList() {
    this.navCtrl.navigateRoot('/subjects');
  }

  openMoodleWebsite() {
    window.open('https://elearn.mmu.ru/', '_blank');
  }

  logout() {
    this.authService.logout();
    this.userService.clearUser();
    this.navCtrl.navigateRoot('/tabs/map');
  }
}
