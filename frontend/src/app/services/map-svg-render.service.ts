import {inject, Injectable} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

@Injectable({providedIn: 'root'})
export class MapSvgRenderService {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  async loadSvg(url: string): Promise<SafeHtml | null> {
    try {
      const svgText = await firstValueFrom(this.http.get(url, {responseType: 'text'}));
      return this.sanitizer.bypassSecurityTrustHtml(svgText);
    } catch {
      return null;
    }
  }

  highlightRoom(container: HTMLElement, roomId: string | null): void {
    const svgElement = container.querySelector('.map-container svg');
    if (!svgElement) return;

    svgElement.querySelectorAll('.place-active').forEach((el) => el.classList.remove('place-active'));

    if (roomId) {
      const target = svgElement.querySelector(`#${roomId}_place`);
      target?.classList.add('place-active');
    }
  }

  zoomToElement(container: HTMLElement, elementId: string | null): void {
    const svgEl = container.querySelector('.map-container svg') as SVGSVGElement | null;
    if (!svgEl) return;

    svgEl.querySelectorAll('.place-active').forEach((el) => el.classList.remove('place-active'));

    if (elementId) {
      const target = svgEl.querySelector(`#${elementId}_place`) as SVGGraphicsElement | null;

      if (target) {
        target.classList.add('place-active');

        try {
          const bbox = target.getBBox();
          const viewBox = svgEl.viewBox.baseVal;

          let originX = 50;
          let originY = 50;

          if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;

            originX = ((centerX - viewBox.x) / viewBox.width) * 100;
            originY = ((centerY - viewBox.y) / viewBox.height) * 100;
          }

          const scale = 2;
          const translateX = -(originX - 50) * scale;
          const translateY = -(originY - 50) * scale;

          svgEl.style.transition = 'transform 0.8s ease-in-out';
          svgEl.style.transformOrigin = '50% 50%';
          svgEl.style.transform = `translate(${translateX}%, ${translateY}%) scale(${scale})`;
        } catch {
        }
      }
    } else {
      svgEl.style.transition = 'transform 0.8s ease-in-out';
      svgEl.style.transformOrigin = '50% 50%';
      svgEl.style.transform = 'translate(0%, 0%) scale(1)';
    }
  }
}
