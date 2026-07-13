import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {IonContent, IonIcon, IonSpinner, NavController} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {chevronForwardOutline} from 'ionicons/icons';
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {User} from "../../models/user.model";

@Component({
  selector: 'app-page-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  imports: [IonContent, IonIcon, IonSpinner],
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
    addIcons({ chevronForwardOutline });
  }

  ngOnInit(): void {
    this.userService.loadUser().subscribe({
      next: (u) => {
        if (!u) {
          this.authService.logout();
          this.userService.clearUser();
          this.navCtrl.navigateRoot('/login');
        }
      },
      error: () => {
        this.logout();
      },
    });

    this.userService.loadUserSubjects().subscribe({
        next: () => {
          this.isLoading.set(false);
        },
        error: () => {
          this.logout();
        }
      }
    )
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

  openSubjectsList(){
    this.navCtrl.navigateRoot('/subjects');
  }

  openMoodleWebsite(){
    window.open('https://elearn.mmu.ru/', '_blank');
  }

  logout(){
    this.authService.logout();
    this.userService.clearUser();
    this.navCtrl.navigateRoot('/tabs/map');
  }
}
