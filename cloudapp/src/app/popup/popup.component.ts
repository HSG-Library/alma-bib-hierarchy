import { Component, ElementRef, OnDestroy, Renderer2, ViewChild } from '@angular/core'
import { Subject } from 'rxjs'

@Component({
	selector: 'popup',
	template: `
    <div #innerWrapper style="width: 100%; height: 100%; overflow: auto;">
      <ng-content></ng-content>
		</div>
		<div *ngIf="popupOpen | async">
			<p>
				Content is displayed in a popup window. Click 'PopIn' to display it here again.
			</p>
		</div>
		`
})
export class PopupComponent implements OnDestroy {

	@ViewChild('innerWrapper') private innerWrapper: ElementRef

	private popoutWindow: Window
	popupOpen: Subject<boolean> = new Subject<boolean>()

	constructor(
		private renderer2: Renderer2,
		private elementRef: ElementRef
	) {
		this.popupOpen.next(false)
	}

	ngOnDestroy(): void {
		this.close()
	}

	public toggle(): void {
		if (!this.popoutWindow || this.popoutWindow.closed) {
			this.open()
		} else {
			this.close()
		}
	}

	public open(): void {
		if (!this.popoutWindow || this.popoutWindow.closed) {

			this.popoutWindow = window.open(
				'',
				`popoutWindow${Date.now()}`,
				`width=${window.parent.window.innerWidth - 20},
        height=${window.innerHeight - 20},
        left=${window.screenX + 10},
        top=${window.screenY - 10}`
			)

			this.popoutWindow.document.title = window.document.title
			this.popoutWindow.document.body.style.margin = '0'

			document.head.querySelectorAll('style').forEach(node => {
				this.popoutWindow.document.head.appendChild(node.cloneNode(true))
			})

			document.head.querySelectorAll('link[rel="stylesheet"]').forEach(node => {
				this.popoutWindow.document.head.insertAdjacentHTML('beforeend',
					`<link rel="stylesheet" type="${(node as HTMLLinkElement).type}" href="${(node as HTMLLinkElement).href}">`)
			})
			this.renderer2.appendChild(this.popoutWindow.document.body, this.innerWrapper.nativeElement)

			this.popoutWindow.addEventListener('unload', () => this.close())
			this.popupOpen.next(true)
		} else {
			this.popoutWindow.focus()
		}
	}

	public close(): void {
		if (this.popoutWindow) {
			this.renderer2.appendChild(this.elementRef.nativeElement, this.innerWrapper.nativeElement)
			this.popupOpen.next(false)
			this.popoutWindow.close()
			this.popoutWindow = null
		}
	}
}
