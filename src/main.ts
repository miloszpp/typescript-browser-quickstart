import './../barecss/css/bare.min.css';

import { Observable, merge, Subject, fromEvent, empty, of, throwError, timer } from 'rxjs';
import { publish, skipWhile, takeWhile, take, tap, map, switchMap, repeatWhen, delay, takeUntil, share, withLatestFrom, retry, retryWhen, filter, throwIfEmpty, delayWhen } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface AnalyzeTask {
  id: number;
  status: 'inProgress' | 'cancelled' | 'finished';
  result?: 'positive' | 'negative';
}

const url = 'http://localhost:3000';

const inputEl = document.getElementById('input-text') as HTMLTextAreaElement;
const resultsSectionEl = document.getElementById('section-results') as HTMLDivElement;
const analyzeButtonEl = document.getElementById('button-analyze') as HTMLButtonElement;
const cancelButtonEl = document.getElementById('button-cancel') as HTMLButtonElement;

const updateUI = (task: AnalyzeTask) => {
  switch (task.status) {
    case 'inProgress':
      resultsSectionEl.innerHTML = 'Loading...';
      return;
    case 'finished':
      resultsSectionEl.innerHTML = `Result: ${task.result === 'positive' ? '😀' : '☹️'}`;
      return;
    case 'cancelled':
      resultsSectionEl.innerHTML = '';
      return;
  }
}

const takeWhileInclusive =
  <T>(predicate: (item: T) => boolean) => (stream$: Observable<T>) =>
    stream$.pipe(
      publish(shared$ => merge(
        shared$.pipe(takeWhile(predicate)),
        shared$.pipe(skipWhile(predicate), take(1)),
      ))
    );

const cancelSubject = new Subject();

const result$ = fromEvent(analyzeButtonEl, 'click').pipe(
  tap(() => cancelSubject.next()),
  map(() => inputEl.value),
  switchMap((text) => ajax.post(`${url}/analyze`, { message: text })),
  map((ajaxResponse) => ajaxResponse.response as AnalyzeTask),
  switchMap((task) => ajax.getJSON<AnalyzeTask>(
    `${url}/analyze/${task.id}`).pipe(
      repeatWhen(delay(1000)), 
      takeWhileInclusive((response) => response.status === 'inProgress'),
      takeUntil(cancelSubject),
    ),
  ),
  share(),
);

result$.subscribe(updateUI);

cancelSubject.pipe(
  withLatestFrom(result$),
  switchMap(([, result]) => 
    result.status === 'inProgress'
      ? ajax.post(`${url}/analyze/${result.id}/cancel`)
      : empty()
  ),
).subscribe(
  () => {
    resultsSectionEl.innerHTML = '';
  }
);

fromEvent(cancelButtonEl, 'click').subscribe(
  () => cancelSubject.next()
);

//--------

interface PriceResult {
  price: number;
  timestamp: number;
}

const getPriceButtonEl = document.getElementById('button-get-price') as HTMLButtonElement;
const priceInputEl = document.getElementById('input-stock-symbol') as HTMLInputElement;
const priceSectionEl = document.getElementById('section-price') as HTMLDivElement;

fromEvent(getPriceButtonEl, 'click').pipe(
  map(() => priceInputEl.value),
  switchMap(symbol => 
    ajax.getJSON<PriceResult>(`${url}/stocks/${symbol}`).pipe(
      retryWhen(error$ => error$.pipe(
        switchMap(error => 
          error.status === 503
          ? of(error)
          : throwError(error)),
        // Fixed interval
        // delay(1000),
        // Exponential backoff
        delayWhen((error, i) => timer(Math.pow(2, i) * 100)),
      ))
    )),
  tap(null, error => priceSectionEl.innerHTML = `Error: ${error}`),
  retry(),
).subscribe(
  result => priceSectionEl.innerHTML = `Price: ${result.price}`,
);

//--------