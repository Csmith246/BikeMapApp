import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css']
})
export class CheckboxComponent implements OnInit {

  @Input() label: String;
  @Input() imgSrc: String = null; //only here to trigger not showing label
  @Input() resetTrigger: Subject<string>;

  @Output() toggled = new EventEmitter<String[]>(); // Emits the proper SQL for the checkbox

  isChecked: Boolean = false;

  constructor() { }

  ngOnInit() {
    this.resetTrigger.subscribe((elem)=>{
      this.isChecked = false;
      this.toggled.emit([this.label, ""]); // reset SQL stored in parent
    });
  }

  toggle(){
    this.isChecked = !this.isChecked;
    let responseSQL = "";
    if(this.isChecked){ 
      responseSQL = `${this.label.toUpperCase()}='Y'`;
      responseSQL = this.label == "Horse" ? "HORSERIDING='Y'" : responseSQL; // Special case. 
    }

    this.toggled.emit([this.label, responseSQL]); // might need to change this to emit the label too
  }

}
