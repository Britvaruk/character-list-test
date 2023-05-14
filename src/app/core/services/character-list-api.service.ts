import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { API_CHARACTER_LIST } from "src/environments/urls";
import { CharacterItem } from "../interfaces/character-item";
import { Pageable } from "../interfaces/pageable";

@Injectable({
  providedIn: 'root',
})
export class CharacterListApiService {
  constructor(private httpClient: HttpClient) {}

  get(
    pageIndex: number = 1, 
    search?: string
  ): Observable<Pageable<CharacterItem>> {
    let params = new HttpParams().set('page', pageIndex);

    if (search) {
      params = params.append('search', search);
    }

    return this.httpClient.get<Pageable<CharacterItem>>(
      API_CHARACTER_LIST, {params}
    );
  }  
}