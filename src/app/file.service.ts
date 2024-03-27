import { Injectable } from '@angular/core';
import { Data } from '@angular/router';

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
  Gender: 'G' | 'B'; // Girls or Boys
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
        SessionNumber: Number(dataCols[19]),
        EventOrder: Number(dataCols[20]),
        SessionDay: Number(dataCols[21]),
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
}
