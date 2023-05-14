import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, map, tap, Observable, switchMap, combineLatest, debounceTime, finalize, startWith } from 'rxjs';
import { CharacterItem } from 'src/app/core/interfaces/character-item';
import { Pageable } from 'src/app/core/interfaces/pageable';
import { CharacterListApiService } from 'src/app/core/services/character-list-api.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  dynamicLoading: boolean = false;

  page: number = 1;
  total: number = 0;
  isLoading: boolean = false;

  searchByName$ = new BehaviorSubject('');

  private page$ = new BehaviorSubject(this.page);

  private characters$ = new BehaviorSubject<CharacterItem[]>([]);

  readonly characterList$ = combineLatest([
    this.page$, this.searchByName$
  ]).pipe(    
    tap(() => this.isLoading = true),
    debounceTime(500),
    switchMap(([page, search]) => this.getData(page, search).pipe(
      tap(res => this.total = res.count),
      map(res => res.results),
      finalize(() => this.isLoading = false),
    )),
    map(res => {      
      if (this.dynamicLoading) {
        const oldList = this.characters$.getValue();
        this.characters$.next([...oldList, ...res]);
        return [...oldList, ...res];
      }
      
      return res;
    }),
  );

  constructor(
    private characterListApiService: CharacterListApiService
  ) {}

  ngOnInit(): void {
    this.initLoadingOnScroll();
  }

  private getData(
    page: number,
    search: string
  ): Observable<Pageable<CharacterItem>> {
    return this.characterListApiService.get(page, search);
  }

  private initLoadingOnScroll(): void {
    const tableWrapperElement = 
      document.getElementById('character-table');
    const tableContentElement = 
      tableWrapperElement?.getElementsByTagName('table')[0];

    tableWrapperElement!.onscroll = () => {
      const scrolledDistance =
        tableWrapperElement!.clientHeight + 
        tableWrapperElement!.scrollTop;
      const maxDistance = tableContentElement!.clientHeight;

      if (maxDistance === scrolledDistance && this.total/this.page > 10 ) {
        this.nextPage();
      }
    };
  }

  changeLoading(isDynamic: boolean): void {
    this.dynamicLoading = isDynamic;

    this.characters$.next([]);
    this.page = 1;
    this.page$.next(this.page);    
  }

  nextPage(): void {
    this.page++;
    this.page$.next(this.page);
  }

  previousPage(): void {
    this.page--;
    this.page$.next(this.page);
  }

  onSearch(event: Event): void {
    let search = (event.target as HTMLInputElement)?.value || '';
    
    this.page = 1;
    this.page$.next(this.page);

    if (search.length >= 3) {
      this.searchByName$.next(search);
    } else {
      this.searchByName$.next('');
    }
  }
}
