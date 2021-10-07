import { Component, ViewChild } from '@angular/core';
import { CSVRecord } from './models/csv.model';
import { HttpClient } from '@angular/common/http';
// import{} from '../environments'
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-root1',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  file: File;
  arrayBuffer: any;
  filelist: any;
  finalresultPass: { tenantID: any; executionTime: any; }[];
  finalresultFail: { requestId: any; idmId: any; errorMessage: any; }[];
  constructor(private http: HttpClient) {

  }
  title = 'anju';
  public records: any[] = [];
  @ViewChild('csvReader') csvReader: any;

  myKeyValueArrayPass = [{ tenantID: null, executionTime: null }];
  myKeyValueArrayFail = [{ requestId: null, idmId: null, errorMessage: null }];



  extractData(fileContent) {

    // tslint:disable-next-line:one-variable-per-declaration
    this.myKeyValueArrayPass = [];
    this.myKeyValueArrayFail = [];

    this.finalresultPass = [];
    // tslint:disable-next-line:one-variable-per-declaration
    let regexPassTenant = /checking (.*?) with/g,
      regexPassxecutionTime = /"executionTimeInSec": (.*?),/g,
      regexRequestId = /--\s*"requestId": "(.*?)",/g,
      regexErrorMsg = /errorMessage": "(.*?)",/g,
      regexidmId = /idmId": "(.*?)",/g,

      resultPassTenant,
      resultPassxecutionTime,
      resultRequestId,
      resultErrorMsg,
      resultidmId;

    // tslint:disable-next-line:no-conditional-assignment
    while (
      (resultPassTenant = regexPassTenant.exec(fileContent))
      && (resultPassxecutionTime = regexPassxecutionTime.exec(fileContent))

    ) {


      this.myKeyValueArrayPass.push({ tenantID: resultPassTenant[1], executionTime: resultPassxecutionTime[1] });
    }
    while (
      (resultRequestId = regexRequestId.exec(fileContent))
      && (resultErrorMsg = regexErrorMsg.exec(fileContent))
      && (resultidmId = regexidmId.exec(fileContent))

    ) {


      this.myKeyValueArrayFail.push({ requestId: resultRequestId[1], errorMessage: resultErrorMsg[1], idmId: resultidmId[1] });
    }


    this.finalresultPass = this.myKeyValueArrayPass.filter(o1 => this.filelist.some(o2 => o1.tenantID === o2.tenant));
    this.finalresultFail = this.myKeyValueArrayFail.filter(o1 => this.filelist.some(o2 => o1.idmId === o2.tenant));

    // console.log(this.finalresult);

  }
  getData() {
    this.http.get('assets/files/Logs.txt', { responseType: 'text' }).subscribe(data => {
      // console.log(data);
      this.extractData(data);

    });
  }
  addfile(event) {
    this.file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(this.file);
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      const data = new Uint8Array(this.arrayBuffer);
      const arr = new Array();
      for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
      const bstr = arr.join('');
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const first_sheet_name = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[first_sheet_name];
      console.log(XLSX.utils.sheet_to_json(worksheet, { raw: true }));
      const arraylist = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      this.filelist = [];
      this.filelist = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      this.getData();

    };
  }
}
