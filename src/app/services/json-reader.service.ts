import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class JsonReaderService {

  constructor(private http: HttpClient) {
  }

  getObject(url) {
    return new Promise(resolve => {
      this.http.get('../../assets/JSON/' + url).subscribe(response => {
        resolve(response);
      });
    });
  }
}

/*
  Example usage :
  // Add this in your class constructor parameters : `private jsonReader: JsonReaderService`
    constructor(private jsonReader: JsonReaderService)

  // Then use the getObject method (which returns a Promise)
  this.jsonReader.getObject('map1.json').then(data => {
      this.myVariable = data;
      console.log(data);
      const {width, height} = data;
      myFunction(data.coolStuff, width, height);
  })

  // To get the data as a specific type/class/interface use the following syntax : `.then(myVariableName: Type => ...)`
    this.jsonReader.getObject('map1.json').then((data: Map) => console.log(data));
    this.jsonReader.getObject('ground1.json').then((data: Ground) => console.log(data));
 */
