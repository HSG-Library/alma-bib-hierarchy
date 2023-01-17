import { Component, ElementRef, OnDestroy, Renderer2, ViewChild } from '@angular/core'
import { Subject } from 'rxjs'
import { ResultTableComponent } from '../result-table/result-table.component'

@Component({
	selector: 'popup',
	template: `
    <div #innerWrapper style="width: 100%; height: 100%; overflow: auto;">
      <ng-content></ng-content>
		</div>
		<div *ngIf="popupOpen | async">
			<p translate>
				popup.windowIsOpen
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
		private elementRef: ElementRef,
	) {
		this.popupOpen.next(false)
	}

	ngOnDestroy(): void {
		this.close(null)
	}

	public toggle(resultTable: ResultTableComponent): void {
		if (!this.popoutWindow || this.popoutWindow.closed) {
			this.open(resultTable)
		} else {
			this.close(resultTable)
		}
	}

	public open(resultTable: ResultTableComponent): void {
		if (!this.popoutWindow || this.popoutWindow.closed) {
			resultTable.inPopup = true
			this.popoutWindow = window.open(
				'',
				`popoutWindow${Date.now()}`,
				`
				directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,
				width=${window.screen.width - 20},
        height=${window.innerHeight - 20}
				`
			)

			this.popoutWindow.addEventListener('beforeunload', (e) => {
				this.close(resultTable)
				e.preventDefault()
				e.returnValue = true
			})

			this.popoutWindow.document.title = window.document.title
			this.popoutWindow.document.body.style.margin = '0'

			document.head.querySelectorAll('link[rel="stylesheet"]').forEach(node => {
				this.popoutWindow.document.head.insertAdjacentHTML('beforeend',
					`<link rel="stylesheet" href="${(node as HTMLLinkElement).href}">`)
			})

			document.head.querySelectorAll('style').forEach(node => {
				this.popoutWindow.document.head.appendChild(node.cloneNode(true))
			})

			Array.from(document.body.classList).forEach((className) => this.popoutWindow.document.body.classList.add(className))
			this.popoutWindow.document.body.classList.add('popup')

			this.popoutWindow.document.head.removeChild(this.popoutWindow.document.head.querySelector('title'))
			this.popoutWindow.document.head.insertAdjacentHTML('afterbegin', `<title>Bib-Hierarchy - Popup - ${resultTable.selectedEntity.entity.description}</title>`)

			this.renderer2.appendChild(this.popoutWindow.document.body, this.innerWrapper.nativeElement)

			this.popoutWindow.addEventListener('unload', () => this.close(resultTable))
			this.popupOpen.next(true)
		} else {
			this.popoutWindow.focus()
		}
	}

	public close(resultTable: ResultTableComponent): void {
		if (this.popoutWindow) {
			this.renderer2.appendChild(this.elementRef.nativeElement, this.innerWrapper.nativeElement)
			this.popupOpen.next(false)
			this.popoutWindow.close()
			this.popoutWindow = null
			if (resultTable) {
				resultTable.inPopup = false
			}
		}
	}
}
