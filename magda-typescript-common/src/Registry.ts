import {
  AspectDefinition,
  AspectDefinitionsApi,
  Record,
  RecordsApi,
  RecordAspectsApi,
  WebHooksApi,
  WebHook
} from "./generated/registry/api";
import * as URI from "urijs";
import retry from "./retry";
import formatServiceError from "./formatServiceError";
import createServiceError from "./createServiceError";

export interface RegistryOptions {
  baseUrl: string;
  maxRetries?: number;
  secondsBetweenRetries?: number;
}

export interface PutResult {
  successfulPuts: number;
  errors: Error[];
}

export interface RecordsPage<I> {
  totalCount: number;
  nextPageToken?: string;
  records: I[];
}

export default class Registry {
  private baseUrl: uri.URI;
  private aspectDefinitionsApi: AspectDefinitionsApi;
  private recordsApi: RecordsApi;
  private webHooksApi: WebHooksApi;
  private recordAspectsApi: RecordAspectsApi;
  private maxRetries: number;
  private secondsBetweenRetries: number;

  constructor({
    baseUrl,
    maxRetries = 10,
    secondsBetweenRetries = 10
  }: RegistryOptions) {
    this.baseUrl = new URI(baseUrl);
    this.maxRetries = maxRetries;
    this.secondsBetweenRetries = secondsBetweenRetries;

    const registryApiUrl = this.baseUrl.toString();
    this.aspectDefinitionsApi = new AspectDefinitionsApi(registryApiUrl);
    this.recordsApi = new RecordsApi(registryApiUrl);
    this.recordsApi.useQuerystring = true; // Use querystring instead of qs to construct URL
    this.recordAspectsApi = new RecordAspectsApi(registryApiUrl);
    this.webHooksApi = new WebHooksApi(registryApiUrl);
  }

  getRecordUrl(id: string): string {
    return this.baseUrl.clone().segment("records").segment(id).toString();
  }

  putAspectDefinition(
    aspectDefinition: AspectDefinition
  ): Promise<AspectDefinition | Error> {
    const operation = () =>
      this.aspectDefinitionsApi.putById(
        encodeURIComponent(aspectDefinition.id),
        aspectDefinition
      );
    return retry(
      operation,
      this.secondsBetweenRetries,
      this.maxRetries,
      (e, retriesLeft) =>
        console.log(
          formatServiceError(
            `Failed to create aspect definition "${aspectDefinition.id}".`,
            e,
            retriesLeft
          )
        )
    )
      .then(result => result.body)
      .catch(createServiceError);
  }

  getRecords<I>(
    aspect?: Array<string>,
    optionalAspect?: Array<string>,
    pageToken?: string,
    dereference?: boolean
  ): Promise<RecordsPage<I> | Error> {
    const operation = (pageToken: string) => () =>
      this.recordsApi.getAll(
        aspect,
        optionalAspect,
        pageToken,
        undefined,
        undefined,
        dereference
      );
    return <any>retry(
      operation(pageToken),
      this.secondsBetweenRetries,
      this.maxRetries,
      (e, retriesLeft) =>
        console.log(
          formatServiceError("Failed to GET records.", e, retriesLeft)
        )
    )
      .then(result => result.body)
      .catch(createServiceError);
  }

  putRecord(record: Record): Promise<Record | Error> {
    const operation = () =>
      this.recordsApi.putById(encodeURIComponent(record.id), record);
    return retry(
      operation,
      this.secondsBetweenRetries,
      this.maxRetries,
      (e, retriesLeft) =>
        console.log(
          formatServiceError(
            `Failed to PUT data registry record with ID "${record.id}".`,
            e,
            retriesLeft
          )
        )
    )
      .then(result => result.body)
      .catch(createServiceError);
  }

  putRecordAspect(
    recordId: string,
    aspectId: string,
    aspect: any
  ): Promise<Record | Error> {
    const operation = () =>
      this.recordAspectsApi.putById(
        encodeURIComponent(recordId),
        aspectId,
        aspect
      );
    return retry(
      operation,
      this.secondsBetweenRetries,
      this.maxRetries,
      (e, retriesLeft) =>
        console.log(
          formatServiceError(
            `Failed to PUT data registry aspect ${aspectId} for record with ID "${recordId}".`,
            e,
            retriesLeft
          )
        )
    )
      .then(result => result.body)
      .catch(createServiceError);
  }

  getHooks(): Promise<WebHook[] | Error> {
    const operation = () => () => this.webHooksApi.getAll();
    return <any>retry(
      operation(),
      this.secondsBetweenRetries,
      this.maxRetries,
      (e, retriesLeft) =>
        console.log(formatServiceError("Failed to GET hooks.", e, retriesLeft))
    )
      .then(result => result.body)
      .catch(createServiceError);
  }

  putHook(hook: WebHook): Promise<WebHook | Error> {
    const operation = () => this.webHooksApi.create(hook);
    return retry(
      operation,
      this.secondsBetweenRetries,
      this.maxRetries,
      (e, retriesLeft) =>
        console.log(
          formatServiceError(`Failed to PUT hook record.`, e, retriesLeft)
        )
    )
      .then(result => result.body)
      .catch(createServiceError);
  }
}
