import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  NavController
} from '@ionic/angular/standalone';
import {addIcons} from 'ionicons';
import {chevronForwardOutline, copyOutline} from 'ionicons/icons';
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {User} from "../../models/user.model";
import {firstValueFrom} from "rxjs";
import {ToastController} from "@ionic/angular";

@Component({
  selector: 'app-page-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  imports: [IonContent, IonIcon, IonSkeletonText, IonButton, IonButtons, IonTitle, IonToolbar, IonHeader, IonModal],
})
export class ProfilePage implements OnInit {
  isLoading = signal<boolean>(true);
  isMajorDetailsModalOpen = signal(false);

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);
  private toastController = inject(ToastController);

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
    addIcons({chevronForwardOutline, copyOutline});
  }

  async ngOnInit() {
    this.isLoading.set(true);
    const u = await firstValueFrom(this.userService.loadUser());
    if (!u) {
      this.authService.logout();
      this.userService.clearUser();
      await this.navCtrl.navigateForward('/login');
      return;
    }

    await firstValueFrom(this.userService.loadUserSubjects());

    this.isLoading.set(false);
  }

  getMajorCode(): string {
    const majorText = this.user()?.major;
    if (!majorText) return '';

    const firstSpaceIndex = majorText.trim().indexOf(' ');
    if (firstSpaceIndex !== -1) {
      return majorText.substring(0, firstSpaceIndex).trim();
    }

    return '';
  }

  getMajorName(): string {
    const majorText = this.user()?.major;
    if (!majorText) return '';

    const firstSpaceIndex = majorText.trim().indexOf(' ');
    if (firstSpaceIndex !== -1) {
      return majorText.substring(firstSpaceIndex + 1).trim();
    }

    return majorText;
  }

  async openMajorDetails() {
    this.isMajorDetailsModalOpen.set(true);
  }

  async copyMajorToClipboard() {
    const majorText = this.user()?.major;
    if (!majorText) return;

    await navigator.clipboard.writeText(majorText);
    this.isMajorDetailsModalOpen.set(false);

    const toast = await this.toastController.create({
      message: 'Скопировано в буфер обмена',
      duration: 1500,
      position: 'bottom',
      cssClass: 'custom-toast'
    });

    await toast.present();
  }

  openSubjectsList() {
    this.navCtrl.navigateForward('/subjects');
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
