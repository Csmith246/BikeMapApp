import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css']
})
export class CheckboxComponent implements OnInit {

  @Input() label: String;
  @Input() imgSrc: String = null;
  @Output() toggled = new EventEmitter<String>(); // Emits the proper SQL for the checkbox

  isChecked: Boolean = false;

  constructor() { }

  ngOnInit() {
  }

  toggle(){
    this.isChecked = !this.isChecked;
    let responseSQL = "";
    if(this.isChecked){ responseSQL = `${this.label.toUpperCase()}='Y'`; }

    this.toggled.emit(responseSQL); // might need to change this to emit the label too
  }

}
