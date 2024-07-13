import {
	Directive,
	ElementRef,
	EventEmitter,
	HostListener,
	Output,
} from "@angular/core";

@Directive({
	selector: "[appClickOutside]",
	standalone: true,
})
export class ClickedOutsideDirective {
	@Output() appClickOutside = new EventEmitter<void>();

	@HostListener("document:click", ["$event"])
	onClick(event: any) {
		const hasShowMenuClass =
			this.elemRef.nativeElement.classList.contains("showMenu");
		if (
			hasShowMenuClass &&
			!this.elemRef.nativeElement.contains(event.target)
		) {
			this.appClickOutside.emit();
			console.log("clickOutside");
		}
	}

	constructor(private elemRef: ElementRef) {}
}
