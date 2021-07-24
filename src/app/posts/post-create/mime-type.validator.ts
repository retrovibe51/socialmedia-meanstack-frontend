import { AbstractControl } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";

// this is an Asynchronous validator function, bcoz the reading in the file by the
//  file reader(in postCreateComponent) is an Asynchronous Task
export const mimeType = (control: AbstractControl): Promise<{[key: string]: any}> | Observable<{[key: string]: any}> => { // For async validator func, the JS object with error code is wrapped byt a Promise or Observable

  if(typeof(control.value) === 'string') {
    return of(null);  // returns that this is valid. of is a quick and easy way of adding or creating an observable which will emit data immediately
  }

  const file = control.value as File;
  const fileReader = new FileReader();

  const frObs = new Observable((observer: Observer<{[key: string]: any}>) => {

    fileReader.addEventListener("loadend", () => {
      const arr = new Uint8Array(fileReader.result as ArrayBuffer)  // array of 8 bit unsigned integers
                        .subarray(0,4);                             // allows us to get the mime type. Beginning index (0) is inclusive & end index (4) is exclusive.
      let header = "";
      let isValid = false;
      for(let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);    // 16 is to convert it to hexadecimal string
      }
      switch(header) {  // The header string will store a defined pattern for the different file types
        case "89504e47":
          isValid = true;
          break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
          isValid = true;
          break;
        default:
          isValid = false;  // Or you can use the blob.type as fallback
          break;
      }
      if(isValid) {
        observer.next(null);  // next() is to emit a new value. null emitted means it is valid.
      }
      else {
        observer.next({ invalidMimeType: true });
      }
      observer.complete();

    });
    fileReader.readAsArrayBuffer(file);   // allows us to access the mime type
  });

  return frObs;
}
