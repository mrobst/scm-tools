import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

export type HeaderRow = {
  [key: string]: string;
};

// Event, Sub, Prelim/Final, Rounds, Ind/Relay, Gender, Age From, Age To, Distance, Stroke,
// 101; 101A; P; 2; I; G; 11; 12; 200; E;

// ???, Div Code, Div Desc, Event Type, Event Fee, Slower than LC, Faster than LC, Slower than SC, Faster than SC, Session Number, Event Order, Session Day, Start Time, Course, Max Entries, Max Ind Entries, Max Relay Entries, Relay Legs
// 0; ; ; N; 0; ; 2: 55.50; ; 2: 53.20; ; ; 1; 1; 1;09:00AM; L; 0; 0; 0; 0 *>

export type DataRow = {
  Event: number;
  SubEvent: string;
  PrelimFinal: 'P' | 'F'; // Prelim or Final
  Rounds: number;
  IndRelay: 'I' | 'R'; // Individual
  Gender: 'G' | 'B' | 'W' | 'M'; // Girls or Boys // Woman or Man
  AgeFrom: number;
  AgeTo: number;
  Distance: number;
  Stroke: 'A' | 'B' | 'C' | 'D' | 'E'; // A=Free, B=Back, C=Breast, D=Fly, E=IM
  DivCode: string;
  DivDesc: string;
  EventType2: string;
  EventFee: number;
  SlowerThanLC: string;
  FasterThanLC: string;
  SlowerThanSC: string;
  FasterThanSC: string;
  SessionNumber: number;
  EventOrder: number;
  SessionDay: number;
  StartTime: string;
  Course: 'L' | 'S'; // Long or Short
  MaxEntries: number;
  MaxIndEntries: number;
  MaxRelayEntries: number;
  RelayLegs: number;
};

type SCMStrokes = 'Free' | 'Back' | 'Breast' | 'Fly' | 'Medley';

export type QTFileRow = {
  poolSize: 25 | 50;
  stroke: SCMStrokes | undefined;
  distance: number; // validate?
  ageFrom: number;
  ageTo: number;
  gender: 'M' | 'F';
  time: string; // mm:ss.SS
};

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor() {}

  async processFile(file: File): Promise<(HeaderRow | DataRow)[]> {
    return this.read(file).then((contents) => {
      const rows = this.convertToArray(contents);
      const rowsAsJSON = rows.map((row, index) =>
        this.convertRowToObject(row, index)
      );
      console.log(rowsAsJSON);
      return rowsAsJSON;
    });
  }

  async read(file: File): Promise<string> {
    const contents = await file.text();
    return contents;
  }

  convertToArray(contents: string): string[] {
    const rows = contents.split('\n');
    console.log(rows.slice(0, 5));
    return rows;
  }

  convertRowToObject(row: string, index: number): HeaderRow | DataRow {
    if (index === 0) {
      const headerRow = this.convertHeaderRow(row);
      return headerRow;
    } else {
      const dataRow = this.convertDataRow(row);
      return dataRow;
    }
  }

  convertHeaderRow(row: string): HeaderRow {
    const headerCols = row.split(';');
    console.log(headerCols);
    let headerRow: HeaderRow = {};
    headerCols.forEach((col, index) => {
      headerCols[index] = col.trim();
      index == 0 ? (headerRow['id'] = col) : (headerRow[col] = '');
      index == 0 ? (headerRow['id'] = col) : (headerRow[col] = '');
    });
    return headerRow;
  }

  convertDataRow(row: string): DataRow {
    const dataCols1 = row.split('*>');
    const dataCols = dataCols1[0].split(';');
    if (dataCols.length > 3) {
      let dataRow: DataRow = {
        // convert the data to the correct type based on the column order
        Event: Number(dataCols[0]),
        SubEvent: dataCols[1],
        PrelimFinal: dataCols[2] as 'P' | 'F', // Prelim or Final
        Rounds: Number(dataCols[3]),
        IndRelay: dataCols[4] as 'I' | 'R', // Individual
        Gender: dataCols[5] as 'G' | 'B',
        AgeFrom: Number(dataCols[6]),
        AgeTo: Number(dataCols[7]),
        Distance: Number(dataCols[8]),
        Stroke: dataCols[9] as 'A' | 'B' | 'C' | 'D' | 'E',
        // what is col 10?
        DivCode: dataCols[11],
        DivDesc: dataCols[12],
        EventType2: dataCols[13],
        EventFee: Number(dataCols[14]),
        SlowerThanLC: dataCols[15],
        FasterThanLC: dataCols[16],
        SlowerThanSC: dataCols[17],
        FasterThanSC: dataCols[18],
        SessionDay: Number(dataCols[19]),
        EventOrder: Number(dataCols[20]),
        SessionNumber: Number(dataCols[21]),
        // what is col 22?
        // what is col 23?
        StartTime: dataCols[24],
        Course: dataCols[25] as 'L' | 'S',
        MaxEntries: Number(dataCols[26]),
        MaxIndEntries: Number(dataCols[27]),
        MaxRelayEntries: Number(dataCols[28]),
        RelayLegs: Number(dataCols[29]),
      };
      return dataRow;
    } else {
      return {} as DataRow;
    }
  }

  // create QT formatted xlsx for import into SCM

  // Pool Size	Stroke	Distance	Age From	Age To	Gender	Time
  // 25	Free	50	9	9	M	01:02.03
  // 25	Free	50	9	9	F	03:04.05

  createQTFileData(event: DataRow[]): QTFileRow[] {
    const QTFileData: QTFileRow[] = [];

    event.forEach((row) => {
      // create SC row
      const QTRowSC: QTFileRow = {
        poolSize: 25,
        stroke: this.convertEV3Stroke(row.Stroke),
        distance: row.Distance,
        ageFrom: row.AgeFrom,
        ageTo: row.AgeTo,
        gender: row.Gender === 'G' || row.Gender === 'W' ? 'F' : 'M',
        time: row.FasterThanSC,
      };
      QTFileData.push(QTRowSC);
      // create LC row
      const QTRowLC: QTFileRow = {
        poolSize: 50,
        stroke: this.convertEV3Stroke(row.Stroke),
        distance: row.Distance,
        ageFrom: row.AgeFrom,
        ageTo: row.AgeTo,
        gender: row.Gender === 'G' || row.Gender === 'W' ? 'F' : 'M',
        time: row.FasterThanLC,
      };
      QTFileData.push(QTRowLC);
    });

    return QTFileData;
  }

  convertQTFileDataToXLSX(qtFileData: QTFileRow[]): void {
    // Prepare new workbook
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('QTs');

    // Write the headers
    const headerRow = worksheet.addRow([
      'Pool Size',
      'Stroke',
      'Distance',
      'Age From',
      'Age To',
      'Gender',
      'Time',
    ]);
    headerRow.font = { bold: true };

    // Format columns
    worksheet.getColumn(1).width = 10; // Pool Size
    worksheet.getColumn(2).width = 10; // Stroke
    worksheet.getColumn(3).width = 10; // Distance
    worksheet.getColumn(4).width = 10; // Age From
    worksheet.getColumn(5).width = 10; // Age To
    worksheet.getColumn(6).width = 10; // Gender
    worksheet.getColumn(7).width = 20; // Time

    // Write the data
    qtFileData.forEach((row) =>
      worksheet.addRow([
        row.poolSize,
        row.stroke,
        row.distance,
        row.ageFrom,
        row.ageTo,
        row.gender,
        row.time,
      ])
    );

    workbook.xlsx.writeBuffer().then(async (data) => {
      // use proper mimetype for Android file opener
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // function to convert number to 2 digits for months
      const number2digits = (num: number) => {
        return num.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        });
      };

      // calculate the current year-mm-dd for the file name
      const dynamicFileName =
        new Date().getFullYear() +
        '-' +
        number2digits(new Date().getMonth() + 1) +
        '-' +
        number2digits(new Date().getDate());

      saveAs(blob, `SCM-QT-Import ${dynamicFileName}.xlsx`);
      console.log('xlsx saved');
    });
    // this.downloading = false;
  }

  convertEV3Stroke(
    stroke: 'A' | 'B' | 'C' | 'D' | 'E'
  ): SCMStrokes | undefined {
    switch (stroke) {
      case 'A':
        return 'Free';
      case 'B':
        return 'Back';
      case 'C':
        return 'Breast';
      case 'D':
        return 'Fly';
      case 'E':
        return 'Medley';
      default:
        return undefined;
    }
  }
}
