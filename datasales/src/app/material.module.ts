import { NgModule } from "@angular/core";
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatRadioModule} from '@angular/material/radio';
import {MatTableModule} from '@angular/material/table';
import { MatPaginatorModule } from "@angular/material/paginator";
import {MatDatepickerModule} from "@angular/material/datepicker";
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';


@NgModule
({
    imports:[MatMenuModule,
        MatToolbarModule,
        MatGridListModule,
        MatIconModule,
        MatButtonModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatCardModule,
        FormsModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        MatRadioModule,
        MatTableModule,
        MatPaginatorModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatRippleModule,
        ReactiveFormsModule
      ],
    exports:[MatMenuModule,
        MatToolbarModule,
        MatGridListModule,
        MatIconModule,
        MatButtonModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatCardModule,
        FormsModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        MatRadioModule,
        MatTableModule,
        MatPaginatorModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatRippleModule, ReactiveFormsModule, MatButtonToggleModule]
})

export class MaterialModule {}
