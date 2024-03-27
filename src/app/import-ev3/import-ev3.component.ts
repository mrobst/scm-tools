import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DataRow, FileService, HeaderRow } from '../file.service';

@Component({
  selector: 'app-import-ev3',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-ev3.component.html',
  styleUrl: './import-ev3.component.scss',
})
export class ImportEv3Component {
  fileService = inject(FileService);

  file: File | null = null;
  headerRow: HeaderRow | null = null;
  dataRows: DataRow[] = [];

  async onFileChange(event: any) {
    this.file = event.target.files[0];
    console.log(this.file);
    if (!this.file) {
      return;
    }
    const rowsAsJSON = await this.fileService.processFile(this.file);
    this.headerRow = rowsAsJSON[0] as HeaderRow;
    this.dataRows = rowsAsJSON.slice(1) as DataRow[];
  }
}
