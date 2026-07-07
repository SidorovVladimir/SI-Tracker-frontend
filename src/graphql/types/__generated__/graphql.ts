import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  JSON: { input: unknown; output: unknown };
};

export type AdminAnomalies = {
  __typename: 'AdminAnomalies';
  missingControlType: Array<AnomalyDevice>;
  missingHistory: Array<AnomalyDevice>;
  missingMpi: Array<AnomalyDevice>;
  statusMismatch: Array<AnomalyDevice>;
};

export type AdminDashboardResponse = {
  __typename: 'AdminDashboardResponse';
  anomalies: AdminAnomalies;
  stats: AdminStats;
};

export type AdminStats = {
  __typename: 'AdminStats';
  companies: Scalars['Int']['output'];
  devices: Scalars['Int']['output'];
  sites: Scalars['Int']['output'];
  standards: Scalars['Int']['output'];
  tariffs: Scalars['Int']['output'];
  users: Scalars['Int']['output'];
};

export type AnomalyDevice = {
  __typename: 'AnomalyDevice';
  id: Scalars['ID']['output'];
  model: Scalars['String']['output'];
  name: Scalars['String']['output'];
  serialNumber: Scalars['String']['output'];
};

export type AuditAction =
  | 'assign_batch'
  | 'create'
  | 'delete'
  | 'remove_batch'
  | 'update'
  | 'verify';

export type AuditLog = {
  __typename: 'AuditLog';
  action: AuditAction;
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  deviceId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  newData: Maybe<Scalars['String']['output']>;
  oldData: Maybe<Scalars['String']['output']>;
  user: Maybe<User>;
};

export type AuditLogFilter = {
  action?: InputMaybe<AuditAction>;
  deviceId?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type AuditLogsResponse = {
  __typename: 'AuditLogsResponse';
  items: Array<AuditLog>;
  totalCount: Scalars['Int']['output'];
};

export type AuthPayload = {
  __typename: 'AuthPayload';
  success: Scalars['Boolean']['output'];
  user: Maybe<User>;
};

export type BatchSyncResponse = {
  __typename: 'BatchSyncResponse';
  batchId: Scalars['ID']['output'];
  details: Array<DeviceBatchSyncResult>;
  syncedCount: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type BudgetGroupBy = 'CITY' | 'COMPANY' | 'SITE';

export type BudgetMatrixResponse = {
  __typename: 'BudgetMatrixResponse';
  grandTotal: Scalars['Int']['output'];
  rows: Array<BudgetRow>;
  targetYear: Scalars['Int']['output'];
};

export type BudgetMonthData = {
  __typename: 'BudgetMonthData';
  month: Scalars['Int']['output'];
  totalCost: Scalars['Int']['output'];
};

export type BudgetPlan = {
  __typename: 'BudgetPlan';
  comment: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  matchedCount: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  totalCost: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
  year: Scalars['Int']['output'];
};

export type BudgetPlanDistributionRow = {
  __typename: 'BudgetPlanDistributionRow';
  baseSubtotal: Scalars['Float']['output'];
  count: Scalars['Int']['output'];
  groupId: Scalars['ID']['output'];
  groupName: Scalars['String']['output'];
  totalCost: Scalars['Float']['output'];
};

export type BudgetPlanFilterInput = {
  city?: InputMaybe<Scalars['ID']['input']>;
  company?: InputMaybe<Scalars['ID']['input']>;
  matchMethod?: InputMaybe<Scalars['String']['input']>;
  productionSite?: InputMaybe<Scalars['ID']['input']>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
};

export type BudgetPlanItem = {
  __typename: 'BudgetPlanItem';
  basePrice: Scalars['Float']['output'];
  budgetPlanId: Scalars['ID']['output'];
  device: Device;
  deviceId: Scalars['ID']['output'];
  deviceModel: Scalars['String']['output'];
  deviceName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  matchHistorySku: Maybe<Scalars['String']['output']>;
  matchMethod: Scalars['String']['output'];
  matchedPricelistItemId: Maybe<Scalars['ID']['output']>;
  totalCost: Scalars['Float']['output'];
  vatAmount: Scalars['Float']['output'];
};

export type BudgetPlanItemsResponse = {
  __typename: 'BudgetPlanItemsResponse';
  items: Array<BudgetPlanItem>;
  totalCostAll: Scalars['Float']['output'];
  totalCount: Scalars['Int']['output'];
};

export type BudgetRow = {
  __typename: 'BudgetRow';
  months: Array<BudgetMonthData>;
  rowId: Scalars['ID']['output'];
  rowName: Scalars['String']['output'];
  totalYearCost: Scalars['Int']['output'];
};

export type ChatDialog = {
  __typename: 'ChatDialog';
  companionId: Scalars['ID']['output'];
  companionName: Scalars['String']['output'];
  lastMessageCreatedAt: Scalars['String']['output'];
  lastMessageText: Scalars['String']['output'];
  unreadCount: Scalars['Int']['output'];
};

export type ChatMessage = {
  __typename: 'ChatMessage';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  recipientId: Scalars['ID']['output'];
  senderId: Scalars['ID']['output'];
  text: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type City = {
  __typename: 'City';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Company = {
  __typename: 'Company';
  address: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CreateBatchInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  number: Scalars['String']['input'];
  plannedDate: Scalars['String']['input'];
  verificationOrganizationId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateBudgetPlanInput = {
  calculationMethod: Scalars['String']['input'];
  cityId?: InputMaybe<Scalars['ID']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['ID']['input']>;
  pricelistIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  productionSiteId?: InputMaybe<Scalars['ID']['input']>;
  year: Scalars['Int']['input'];
};

export type CreateCityInput = {
  name: Scalars['String']['input'];
};

export type CreateCompanyInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateDeviceInput = {
  accuracy?: InputMaybe<Scalars['String']['input']>;
  archived: Scalars['Boolean']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  csmCode?: InputMaybe<Scalars['String']['input']>;
  equipmentTypeId?: InputMaybe<Scalars['ID']['input']>;
  grsiNumber?: InputMaybe<Scalars['String']['input']>;
  inventoryNumber?: InputMaybe<Scalars['String']['input']>;
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  measurementRange?: InputMaybe<Scalars['String']['input']>;
  measurementTypes?: InputMaybe<Array<Scalars['ID']['input']>>;
  model: Scalars['String']['input'];
  name: Scalars['String']['input'];
  nomenclature?: InputMaybe<Scalars['String']['input']>;
  primaryStandarts?: InputMaybe<Array<Scalars['ID']['input']>>;
  productionSiteId: Scalars['ID']['input'];
  receiptDate?: InputMaybe<Scalars['String']['input']>;
  releaseDate?: InputMaybe<Scalars['String']['input']>;
  scopes?: InputMaybe<Array<Scalars['ID']['input']>>;
  serialNumber: Scalars['String']['input'];
  statusId: Scalars['ID']['input'];
  verificationInterval?: InputMaybe<Scalars['Int']['input']>;
  verifications?: InputMaybe<Array<VerificationInput>>;
};

export type CreateEquipmentTypeInput = {
  name: Scalars['String']['input'];
};

export type CreateMeasurementTypeInput = {
  name: Scalars['String']['input'];
};

export type CreateMetrologyControlTypeInput = {
  name: Scalars['String']['input'];
};

export type CreatePricelistInput = {
  isRegulated: Scalars['Boolean']['input'];
  items: Array<PricelistItemInput>;
  title: Scalars['String']['input'];
  verificationOrganizationId: Scalars['ID']['input'];
  year: Scalars['Int']['input'];
};

export type CreatePrimaryStandartInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateProductionSiteInput = {
  cityId: Scalars['ID']['input'];
  companyId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type CreateScopeInput = {
  name: Scalars['String']['input'];
};

export type CreateStatusInput = {
  name: Scalars['String']['input'];
};

export type CreateUserInput = {
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  login: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type CreateVerificationInput = {
  batchId?: InputMaybe<Scalars['ID']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  cost?: InputMaybe<Scalars['Float']['input']>;
  date: Scalars['String']['input'];
  deviceId: Scalars['ID']['input'];
  metrologyControleTypeId: Scalars['ID']['input'];
  protocolNumber: Scalars['String']['input'];
  result: Scalars['String']['input'];
  validUntil?: InputMaybe<Scalars['String']['input']>;
  verificationOrganizationId: Scalars['ID']['input'];
};

export type CreateVerificationOrganizationInput = {
  name: Scalars['String']['input'];
};

export type CsmTariffTimelinePoint = {
  __typename: 'CsmTariffTimelinePoint';
  csmName: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  year: Scalars['Int']['output'];
};

export type CsmTariffTrendResponse = {
  __typename: 'CsmTariffTrendResponse';
  serviceName: Scalars['String']['output'];
  timeline: Array<CsmTariffTimelinePoint>;
};

export type Device = {
  __typename: 'Device';
  accuracy: Maybe<Scalars['String']['output']>;
  archived: Scalars['Boolean']['output'];
  comment: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  csmCode: Maybe<Scalars['String']['output']>;
  equipmentTypeId: Maybe<Scalars['ID']['output']>;
  grsiNumber: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  inventoryNumber: Maybe<Scalars['String']['output']>;
  manufacturer: Maybe<Scalars['String']['output']>;
  measurementRange: Maybe<Scalars['String']['output']>;
  model: Scalars['String']['output'];
  name: Scalars['String']['output'];
  nomenclature: Maybe<Scalars['String']['output']>;
  productionSiteId: Scalars['ID']['output'];
  receiptDate: Maybe<Scalars['String']['output']>;
  releaseDate: Maybe<Scalars['String']['output']>;
  serialNumber: Scalars['String']['output'];
  statusId: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
  verificationInterval: Maybe<Scalars['Int']['output']>;
};

export type DeviceBarcodeData = {
  __typename: 'DeviceBarcodeData';
  controlType: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  model: Scalars['String']['output'];
  name: Scalars['String']['output'];
  serialNumber: Scalars['String']['output'];
  statusName: Maybe<Scalars['String']['output']>;
  validUntil: Maybe<Scalars['String']['output']>;
};

export type DeviceBatchSyncResult = {
  __typename: 'DeviceBatchSyncResult';
  deviceId: Scalars['ID']['output'];
  message: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type DeviceFilterInput = {
  archived?: InputMaybe<Scalars['Boolean']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  cityId?: InputMaybe<Scalars['ID']['input']>;
  company?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['ID']['input']>;
  dateEnd?: InputMaybe<Scalars['String']['input']>;
  dateStart?: InputMaybe<Scalars['String']['input']>;
  deviceName?: InputMaybe<Scalars['String']['input']>;
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
  matchMethod?: InputMaybe<Scalars['String']['input']>;
  metrologyControle?: InputMaybe<Scalars['String']['input']>;
  productionSite?: InputMaybe<Scalars['String']['input']>;
  productionSiteId?: InputMaybe<Scalars['ID']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type DeviceInBatch = {
  __typename: 'DeviceInBatch';
  id: Scalars['ID']['output'];
  model: Scalars['String']['output'];
  name: Scalars['String']['output'];
  serialNumber: Scalars['String']['output'];
  verifications: Maybe<Array<ShortVerification>>;
};

export type DeviceTableItem = {
  __typename: 'DeviceTableItem';
  archived: Maybe<Scalars['Boolean']['output']>;
  grsiNumber: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  inventoryNumber: Maybe<Scalars['String']['output']>;
  latestVerification: Maybe<VerificationTableItem>;
  manufacturer: Maybe<Scalars['String']['output']>;
  model: Scalars['String']['output'];
  name: Scalars['String']['output'];
  productionSite: ProductionSiteRelation;
  receiptDate: Maybe<Scalars['String']['output']>;
  releaseDate: Maybe<Scalars['String']['output']>;
  serialNumber: Scalars['String']['output'];
  status: Status;
  verificationInterval: Maybe<Scalars['Int']['output']>;
};

export type DeviceToBatchRelation = {
  __typename: 'DeviceToBatchRelation';
  device: DeviceInBatch;
  deviceStatus: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type DeviceWithRelations = {
  __typename: 'DeviceWithRelations';
  accuracy: Maybe<Scalars['String']['output']>;
  archived: Scalars['Boolean']['output'];
  comment: Maybe<Scalars['String']['output']>;
  csmCode: Maybe<Scalars['String']['output']>;
  equipmentType: Maybe<EquipmentType>;
  grsiNumber: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  inventoryNumber: Maybe<Scalars['String']['output']>;
  manufacturer: Maybe<Scalars['String']['output']>;
  measurementRange: Maybe<Scalars['String']['output']>;
  measurementTypes: Array<MeasurementType>;
  model: Scalars['String']['output'];
  name: Scalars['String']['output'];
  nomenclature: Maybe<Scalars['String']['output']>;
  primaryStandarts: Array<PrimaryStandart>;
  productionSite: ProductionSiteRelation;
  receiptDate: Maybe<Scalars['String']['output']>;
  releaseDate: Maybe<Scalars['String']['output']>;
  scopes: Array<Scope>;
  serialNumber: Scalars['String']['output'];
  status: Status;
  verificationInterval: Maybe<Scalars['Int']['output']>;
  verifications: Array<VerificationRelation>;
};

export type DevicesWithRelationsResponse = {
  __typename: 'DevicesWithRelationsResponse';
  items: Array<DeviceTableItem>;
  totalCount: Scalars['Int']['output'];
};

export type DraftBatchOption = {
  __typename: 'DraftBatchOption';
  id: Scalars['ID']['output'];
  number: Scalars['String']['output'];
};

export type EquipmentType = {
  __typename: 'EquipmentType';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type FinancialAnalyticsResponse = {
  __typename: 'FinancialAnalyticsResponse';
  byCities: Array<FinancialByCity>;
  byCompanies: Array<FinancialByCompany>;
  byProductionSites: Array<FinancialByProductionSite>;
  monthlyTimeline: Array<FinancialMonthlyTimeline>;
  totalSpent: Scalars['Float']['output'];
};

export type FinancialByCity = {
  __typename: 'FinancialByCity';
  amount: Scalars['Float']['output'];
  cityName: Scalars['String']['output'];
};

export type FinancialByCompany = {
  __typename: 'FinancialByCompany';
  amount: Scalars['Float']['output'];
  companyName: Scalars['String']['output'];
};

export type FinancialByProductionSite = {
  __typename: 'FinancialByProductionSite';
  amount: Scalars['Float']['output'];
  fullSiteLabel: Scalars['String']['output'];
  siteId: Scalars['ID']['output'];
};

export type FinancialMonthlyTimeline = {
  __typename: 'FinancialMonthlyTimeline';
  amount: Scalars['Float']['output'];
  month: Scalars['Int']['output'];
};

export type ImportDeviceItemInput = {
  accuracy?: InputMaybe<Scalars['String']['input']>;
  cityName: Scalars['String']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  companyName: Scalars['String']['input'];
  equipmentTypeName?: InputMaybe<Scalars['String']['input']>;
  grsiNumber?: InputMaybe<Scalars['String']['input']>;
  inventoryNumber?: InputMaybe<Scalars['String']['input']>;
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  measurementRange?: InputMaybe<Scalars['String']['input']>;
  measurementTypesNames?: InputMaybe<Scalars['String']['input']>;
  model: Scalars['String']['input'];
  name: Scalars['String']['input'];
  nomenclature?: InputMaybe<Scalars['String']['input']>;
  primaryStandardsNames?: InputMaybe<Scalars['String']['input']>;
  productionSiteName: Scalars['String']['input'];
  scopesNames?: InputMaybe<Scalars['String']['input']>;
  serialNumber: Scalars['String']['input'];
  statusName: Scalars['String']['input'];
  verificationInterval?: InputMaybe<Scalars['String']['input']>;
};

export type JobStatusResponse = {
  __typename: 'JobStatusResponse';
  failedReason: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  isFailed: Scalars['Boolean']['output'];
  progress: Maybe<Scalars['JSON']['output']>;
};

export type LoginUserInput = {
  login: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MeasurementType = {
  __typename: 'MeasurementType';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type MetrologyControlType = {
  __typename: 'MetrologyControlType';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type MonthlySummary = {
  __typename: 'MonthlySummary';
  autoCount: Scalars['Int']['output'];
  manualCount: Scalars['Int']['output'];
  month: Scalars['String']['output'];
};

export type Mutation = {
  __typename: 'Mutation';
  addDevicesToBatch: Scalars['Boolean']['output'];
  approveBudgetPlan: BudgetPlan;
  createBudgetPlan: BudgetPlan;
  createCity: City;
  createCompany: Company;
  createDevice: Device;
  createEquipmentType: EquipmentType;
  createMeasurementType: MeasurementType;
  createMetrologyControlType: MetrologyControlType;
  createPricelist: QueuedJobResponse;
  createPrimaryStandart: PrimaryStandart;
  createProductionSite: ProductionSite;
  createScope: Scope;
  createStatus: Status;
  createUser: User;
  createVerification: VerificationModal;
  createVerificationBatch: VerificationBatch;
  createVerificationOrganization: VerificationOrganization;
  deleteBudgetPlan: Scalars['Boolean']['output'];
  deleteCity: Scalars['Boolean']['output'];
  deleteCompany: Scalars['Boolean']['output'];
  deleteDevice: Scalars['Boolean']['output'];
  deleteEquipmentType: Scalars['Boolean']['output'];
  deleteLog: Scalars['Boolean']['output'];
  deleteMeasurementType: Scalars['Boolean']['output'];
  deleteMetrologyControlType: Scalars['Boolean']['output'];
  deletePricelist: Scalars['Boolean']['output'];
  deletePrimaryStandart: Scalars['Boolean']['output'];
  deleteProductionSite: Scalars['Boolean']['output'];
  deleteScope: Scalars['Boolean']['output'];
  deleteStatus: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  deleteVerificationBatch: Scalars['Boolean']['output'];
  deleteVerificationOrganization: Scalars['Boolean']['output'];
  importDevicesFromExcel: QueuedJobResponse;
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  markAllNotificationsAsRead: Scalars['Boolean']['output'];
  markAsRead: Scalars['Boolean']['output'];
  markNotificationAsRead: Scalars['Boolean']['output'];
  register: AuthPayload;
  removeDevicesFromBatch: Scalars['Boolean']['output'];
  syncBatchWithArshin: QueuedJobResponse;
  syncDeviceWithArshin: Device;
  updateBatchStatus: VerificationBatch;
  updateBudgetPlanItemPrice: BudgetPlanItem;
  updateCity: City;
  updateCompany: Company;
  updateDevice: Device;
  updateEquipmentType: EquipmentType;
  updateMeasurementType: MeasurementType;
  updateMetrologyControlType: MetrologyControlType;
  updatePrimaryStandart: PrimaryStandart;
  updateProductionSite: ProductionSite;
  updateScope: Scope;
  updateStatus: Status;
  updateUser: User;
  updateVerificationOrganization: VerificationOrganization;
};

export type MutationAddDevicesToBatchArgs = {
  batchId: Scalars['ID']['input'];
  deviceIds: Array<Scalars['ID']['input']>;
};

export type MutationApproveBudgetPlanArgs = {
  id: Scalars['ID']['input'];
};

export type MutationCreateBudgetPlanArgs = {
  input: CreateBudgetPlanInput;
};

export type MutationCreateCityArgs = {
  input: CreateCityInput;
};

export type MutationCreateCompanyArgs = {
  input: CreateCompanyInput;
};

export type MutationCreateDeviceArgs = {
  input: CreateDeviceInput;
};

export type MutationCreateEquipmentTypeArgs = {
  input: CreateEquipmentTypeInput;
};

export type MutationCreateMeasurementTypeArgs = {
  input: CreateMeasurementTypeInput;
};

export type MutationCreateMetrologyControlTypeArgs = {
  input: CreateMetrologyControlTypeInput;
};

export type MutationCreatePricelistArgs = {
  input: CreatePricelistInput;
};

export type MutationCreatePrimaryStandartArgs = {
  input: CreatePrimaryStandartInput;
};

export type MutationCreateProductionSiteArgs = {
  input: CreateProductionSiteInput;
};

export type MutationCreateScopeArgs = {
  input: CreateScopeInput;
};

export type MutationCreateStatusArgs = {
  input: CreateStatusInput;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationCreateVerificationArgs = {
  input: CreateVerificationInput;
};

export type MutationCreateVerificationBatchArgs = {
  input: CreateBatchInput;
};

export type MutationCreateVerificationOrganizationArgs = {
  input: CreateVerificationOrganizationInput;
};

export type MutationDeleteBudgetPlanArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteCityArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteCompanyArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteDeviceArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteEquipmentTypeArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteLogArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteMeasurementTypeArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteMetrologyControlTypeArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeletePricelistArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeletePrimaryStandartArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteProductionSiteArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteScopeArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteStatusArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteVerificationBatchArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteVerificationOrganizationArgs = {
  id: Scalars['ID']['input'];
};

export type MutationImportDevicesFromExcelArgs = {
  input: Array<ImportDeviceItemInput>;
};

export type MutationLoginArgs = {
  input: LoginUserInput;
};

export type MutationMarkAsReadArgs = {
  senderId: Scalars['ID']['input'];
};

export type MutationMarkNotificationAsReadArgs = {
  id: Scalars['ID']['input'];
};

export type MutationRegisterArgs = {
  input: CreateUserInput;
};

export type MutationRemoveDevicesFromBatchArgs = {
  batchId: Scalars['ID']['input'];
  deviceIds: Array<Scalars['ID']['input']>;
};

export type MutationSyncBatchWithArshinArgs = {
  batchId: Scalars['ID']['input'];
};

export type MutationSyncDeviceWithArshinArgs = {
  input: SyncDeviceWithArshinInput;
};

export type MutationUpdateBatchStatusArgs = {
  id: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};

export type MutationUpdateBudgetPlanItemPriceArgs = {
  input: UpdateBudgetPlanItemPriceInput;
};

export type MutationUpdateCityArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCityInput;
};

export type MutationUpdateCompanyArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCompanyInput;
};

export type MutationUpdateDeviceArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDeviceInput;
};

export type MutationUpdateEquipmentTypeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateEquipmentTypeInput;
};

export type MutationUpdateMeasurementTypeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMeasurementTypeInput;
};

export type MutationUpdateMetrologyControlTypeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMetrologyControlTypeInput;
};

export type MutationUpdatePrimaryStandartArgs = {
  id: Scalars['ID']['input'];
  input: UpdatePrimaryStandartInput;
};

export type MutationUpdateProductionSiteArgs = {
  input: UpdateProductionSiteInput;
};

export type MutationUpdateScopeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateScopeInput;
};

export type MutationUpdateStatusArgs = {
  id: Scalars['ID']['input'];
  input: UpdateStatusInput;
};

export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};

export type MutationUpdateVerificationOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: UpdateVerificationOrganizationInput;
};

export type PlanningPoolItem = {
  __typename: 'PlanningPoolItem';
  controlType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isManualPlacement: Scalars['Boolean']['output'];
  isOverdue: Scalars['Boolean']['output'];
  model: Scalars['String']['output'];
  name: Scalars['String']['output'];
  serialNumber: Scalars['String']['output'];
  suggestedMonth: Scalars['String']['output'];
  targetBatchId: Maybe<Scalars['ID']['output']>;
  validUntil: Maybe<Scalars['String']['output']>;
};

export type PlanningPoolResponse = {
  __typename: 'PlanningPoolResponse';
  items: Array<PlanningPoolItem>;
  meta: PoolMeta;
  totalCount: Scalars['Int']['output'];
};

export type PoolMeta = {
  __typename: 'PoolMeta';
  typeCounts: Array<PoolMetaTypeCounts>;
  unassignedCount: Scalars['Int']['output'];
};

export type PoolMetaTypeCounts = {
  __typename: 'PoolMetaTypeCounts';
  count: Scalars['Int']['output'];
  typeName: Scalars['String']['output'];
};

export type Pricelist = {
  __typename: 'Pricelist';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isRegulated: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  verificationOrganization: VerificationOrganizationRelation;
  verificationOrganizationId: Scalars['ID']['output'];
  year: Scalars['Int']['output'];
};

export type PricelistItemInput = {
  csmCode?: InputMaybe<Scalars['String']['input']>;
  grsiNumber?: InputMaybe<Scalars['String']['input']>;
  modelOrType?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
};

export type PrimaryStandart = {
  __typename: 'PrimaryStandart';
  createdAt: Scalars['String']['output'];
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type ProductionAnalyticsResponse = {
  __typename: 'ProductionAnalyticsResponse';
  byCities: Array<QuantitiveItem>;
  byCompanies: Array<QuantitiveItem>;
  byProductionSites: Array<QuantitiveItem>;
  totalCalibrated: Scalars['Int']['output'];
  totalRejected: Scalars['Int']['output'];
  totalVerified: Scalars['Int']['output'];
};

export type ProductionSite = {
  __typename: 'ProductionSite';
  cityId: Scalars['ID']['output'];
  companyId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type ProductionSiteRelation = {
  __typename: 'ProductionSiteRelation';
  city: City;
  company: Company;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type ProductionSiteSelectOption = {
  __typename: 'ProductionSiteSelectOption';
  cityId: Scalars['ID']['output'];
  companyId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type QuantitiveItem = {
  __typename: 'QuantitiveItem';
  count: Scalars['Int']['output'];
  label: Scalars['String']['output'];
};

export type Query = {
  __typename: 'Query';
  budgetPlan: Maybe<BudgetPlan>;
  budgetPlanItems: BudgetPlanItemsResponse;
  budgetPlans: Array<BudgetPlan>;
  cities: Array<City>;
  city: City;
  companies: Array<Company>;
  company: Company;
  device: Maybe<DeviceWithRelations>;
  deviceAuditLogs: AuditLogsResponse;
  devices: Array<Device>;
  devicesWithRelations: DevicesWithRelationsResponse;
  equipmentType: EquipmentType;
  equipmentTypes: Array<EquipmentType>;
  executeRawSql: RawSqlResponse;
  getAdminDashboardStats: AdminDashboardResponse;
  getBudgetMatrix: BudgetMatrixResponse;
  getBudgetPlanDistribution: Array<BudgetPlanDistributionRow>;
  getChatDialogs: Array<ChatDialog>;
  getChatHistory: Array<ChatMessage>;
  getChatUsers: Array<User>;
  getCsmTariffTrend: CsmTariffTrendResponse;
  getDevicesBarcodeData: Array<DeviceBarcodeData>;
  getDraftBatchesByMonth: Array<DraftBatchOption>;
  getFinancialAnalytics: FinancialAnalyticsResponse;
  getJobStatus: Maybe<JobStatusResponse>;
  getPlanningPoolByMonth: PlanningPoolResponse;
  getProductionAnalytics: ProductionAnalyticsResponse;
  getProductionSitesForSelect: Array<ProductionSite>;
  getSystemNotifications: Array<SystemNotification>;
  getTotalUnreadCount: Scalars['Int']['output'];
  getUnreadNotificationsCount: Scalars['Int']['output'];
  getVerificationBatches: Array<VerificationBatch>;
  getVerificationRisks: VerificationRisksResponse;
  getYearlyCalendarSummary: Array<MonthlySummary>;
  me: Maybe<User>;
  measurementType: MeasurementType;
  measurementTypes: Array<MeasurementType>;
  metrologyControlType: MetrologyControlType;
  metrologyControlTypes: Array<MetrologyControlType>;
  pricelist: Maybe<Pricelist>;
  pricelists: Array<Pricelist>;
  primaryStandart: PrimaryStandart;
  primaryStandarts: Array<PrimaryStandart>;
  productionSite: ProductionSiteSelectOption;
  productionSites: Array<ProductionSiteSelectOption>;
  scope: Scope;
  scopes: Array<Scope>;
  status: Status;
  statuses: Array<Status>;
  user: User;
  users: Array<User>;
  verificationOrganization: VerificationOrganization;
  verificationOrganizations: Array<VerificationOrganization>;
};

export type QueryBudgetPlanArgs = {
  id: Scalars['ID']['input'];
};

export type QueryBudgetPlanItemsArgs = {
  budgetId: Scalars['ID']['input'];
  filter?: InputMaybe<BudgetPlanFilterInput>;
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
};

export type QueryCityArgs = {
  id: Scalars['ID']['input'];
};

export type QueryCompanyArgs = {
  id: Scalars['ID']['input'];
};

export type QueryDeviceArgs = {
  id: Scalars['ID']['input'];
};

export type QueryDeviceAuditLogsArgs = {
  filter?: InputMaybe<AuditLogFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryDevicesWithRelationsArgs = {
  filter?: InputMaybe<DeviceFilterInput>;
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
};

export type QueryEquipmentTypeArgs = {
  id: Scalars['ID']['input'];
};

export type QueryExecuteRawSqlArgs = {
  sqlQuery: Scalars['String']['input'];
};

export type QueryGetBudgetMatrixArgs = {
  cityId?: InputMaybe<Scalars['ID']['input']>;
  companyId?: InputMaybe<Scalars['ID']['input']>;
  groupBy: BudgetGroupBy;
  siteId?: InputMaybe<Scalars['ID']['input']>;
  targetYear: Scalars['Int']['input'];
};

export type QueryGetBudgetPlanDistributionArgs = {
  budgetId: Scalars['ID']['input'];
  groupBy: Scalars['String']['input'];
};

export type QueryGetChatHistoryArgs = {
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
  recipientId: Scalars['ID']['input'];
};

export type QueryGetCsmTariffTrendArgs = {
  siteId: Scalars['String']['input'];
};

export type QueryGetDevicesBarcodeDataArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type QueryGetDraftBatchesByMonthArgs = {
  plannedMonth: Scalars['String']['input'];
};

export type QueryGetFinancialAnalyticsArgs = {
  month?: InputMaybe<Scalars['Int']['input']>;
  year: Scalars['Int']['input'];
};

export type QueryGetJobStatusArgs = {
  jobId: Scalars['ID']['input'];
};

export type QueryGetPlanningPoolByMonthArgs = {
  companyDefaultLeadTime?: InputMaybe<Scalars['Int']['input']>;
  controlTypeId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  targetMonth: Scalars['String']['input'];
};

export type QueryGetProductionAnalyticsArgs = {
  month?: InputMaybe<Scalars['Int']['input']>;
  year: Scalars['Int']['input'];
};

export type QueryGetVerificationBatchesArgs = {
  status?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryGetYearlyCalendarSummaryArgs = {
  companyDefaultLeadTime?: InputMaybe<Scalars['Int']['input']>;
  year: Scalars['Int']['input'];
};

export type QueryMeasurementTypeArgs = {
  id: Scalars['ID']['input'];
};

export type QueryMetrologyControlTypeArgs = {
  id: Scalars['ID']['input'];
};

export type QueryPricelistArgs = {
  id: Scalars['ID']['input'];
};

export type QueryPrimaryStandartArgs = {
  id: Scalars['ID']['input'];
};

export type QueryProductionSiteArgs = {
  id: Scalars['ID']['input'];
};

export type QueryScopeArgs = {
  id: Scalars['ID']['input'];
};

export type QueryStatusArgs = {
  id: Scalars['ID']['input'];
};

export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type QueryVerificationOrganizationArgs = {
  id: Scalars['ID']['input'];
};

export type QueuedJobResponse = {
  __typename: 'QueuedJobResponse';
  batchId: Maybe<Scalars['ID']['output']>;
  itemCount: Maybe<Scalars['Int']['output']>;
  jobId: Scalars['ID']['output'];
  message: Scalars['String']['output'];
};

export type RawSqlResponse = {
  __typename: 'RawSqlResponse';
  affectedRows: Maybe<Scalars['Int']['output']>;
  columns: Array<Scalars['String']['output']>;
  errorMessage: Maybe<Scalars['String']['output']>;
  rows: Array<Scalars['JSON']['output']>;
  success: Scalars['Boolean']['output'];
};

export type RiskCityData = {
  __typename: 'RiskCityData';
  companies: Array<RiskCompanyData>;
  expiredCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
  totalCount: Scalars['Int']['output'];
  warningCount: Scalars['Int']['output'];
};

export type RiskCompanyData = {
  __typename: 'RiskCompanyData';
  expiredCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  sites: Array<RiskSiteData>;
  status: Scalars['String']['output'];
  totalCount: Scalars['Int']['output'];
  warningCount: Scalars['Int']['output'];
};

export type RiskSiteData = {
  __typename: 'RiskSiteData';
  expiredCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
  totalCount: Scalars['Int']['output'];
  warningCount: Scalars['Int']['output'];
};

export type Scope = {
  __typename: 'Scope';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type ShortVerification = {
  __typename: 'ShortVerification';
  batchId: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
};

export type Status = {
  __typename: 'Status';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type SyncDeviceWithArshinInput = {
  batchId: Scalars['ID']['input'];
  deviceId: Scalars['ID']['input'];
};

export type SystemNotification = {
  __typename: 'SystemNotification';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  userId: Maybe<Scalars['ID']['output']>;
};

export type UpdateBudgetPlanItemPriceInput = {
  itemId: Scalars['ID']['input'];
  manualPrice: Scalars['Float']['input'];
};

export type UpdateCityInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCompanyInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type UpdateDeviceInput = {
  accuracy?: InputMaybe<Scalars['String']['input']>;
  archived: Scalars['Boolean']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  csmCode?: InputMaybe<Scalars['String']['input']>;
  equipmentTypeId?: InputMaybe<Scalars['ID']['input']>;
  grsiNumber?: InputMaybe<Scalars['String']['input']>;
  inventoryNumber?: InputMaybe<Scalars['String']['input']>;
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  measurementRange?: InputMaybe<Scalars['String']['input']>;
  measurementTypes?: InputMaybe<Array<Scalars['ID']['input']>>;
  model: Scalars['String']['input'];
  name: Scalars['String']['input'];
  nomenclature?: InputMaybe<Scalars['String']['input']>;
  primaryStandarts?: InputMaybe<Array<Scalars['ID']['input']>>;
  productionSiteId: Scalars['ID']['input'];
  receiptDate?: InputMaybe<Scalars['String']['input']>;
  releaseDate?: InputMaybe<Scalars['String']['input']>;
  scopes?: InputMaybe<Array<Scalars['ID']['input']>>;
  serialNumber: Scalars['String']['input'];
  statusId: Scalars['ID']['input'];
  verificationInterval?: InputMaybe<Scalars['Int']['input']>;
  verifications?: InputMaybe<Array<VerificationInput>>;
};

export type UpdateEquipmentTypeInput = {
  name: Scalars['String']['input'];
};

export type UpdateMeasurementTypeInput = {
  name: Scalars['String']['input'];
};

export type UpdateMetrologyControlTypeInput = {
  name: Scalars['String']['input'];
};

export type UpdatePrimaryStandartInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type UpdateProductionSiteInput = {
  cityId: Scalars['ID']['input'];
  companyId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type UpdateScopeInput = {
  name: Scalars['String']['input'];
};

export type UpdateStatusInput = {
  name: Scalars['String']['input'];
};

export type UpdateUserInput = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateVerificationOrganizationInput = {
  name: Scalars['String']['input'];
};

export type User = {
  __typename: 'User';
  createdAt: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  login: Scalars['String']['output'];
  role: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Verification = {
  __typename: 'Verification';
  comment: Maybe<Scalars['String']['output']>;
  cost: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  date: Maybe<Scalars['String']['output']>;
  deviceId: Scalars['ID']['output'];
  documentUrl: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metrologyControleTypeId: Maybe<Scalars['ID']['output']>;
  organization: Maybe<Scalars['String']['output']>;
  protocolNumber: Maybe<Scalars['String']['output']>;
  result: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  validUntil: Maybe<Scalars['String']['output']>;
  verificationOrganizationId: Maybe<Scalars['ID']['output']>;
};

export type VerificationBatch = {
  __typename: 'VerificationBatch';
  comment: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  devicesToBatches: Array<DeviceToBatchRelation>;
  id: Scalars['ID']['output'];
  number: Scalars['String']['output'];
  plannedDate: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  verificationOrganizationId: Maybe<Scalars['ID']['output']>;
};

export type VerificationInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  cost?: InputMaybe<Scalars['Float']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  documentUrl?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  metrologyControleTypeId?: InputMaybe<Scalars['ID']['input']>;
  organization?: InputMaybe<Scalars['String']['input']>;
  protocolNumber?: InputMaybe<Scalars['String']['input']>;
  result?: InputMaybe<Scalars['String']['input']>;
  validUntil?: InputMaybe<Scalars['String']['input']>;
  verificationOrganizationId?: InputMaybe<Scalars['ID']['input']>;
};

export type VerificationModal = {
  __typename: 'VerificationModal';
  batchId: Maybe<Scalars['ID']['output']>;
  comment: Maybe<Scalars['String']['output']>;
  cost: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  date: Scalars['String']['output'];
  deviceId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  metrologyControleTypeId: Scalars['ID']['output'];
  protocolNumber: Scalars['String']['output'];
  result: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  validUntil: Maybe<Scalars['String']['output']>;
  verificationOrganizationId: Scalars['ID']['output'];
};

export type VerificationOrganization = {
  __typename: 'VerificationOrganization';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type VerificationOrganizationRelation = {
  __typename: 'VerificationOrganizationRelation';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type VerificationRelation = {
  __typename: 'VerificationRelation';
  comment: Maybe<Scalars['String']['output']>;
  cost: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  date: Maybe<Scalars['String']['output']>;
  deviceId: Scalars['ID']['output'];
  documentUrl: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metrologyControleType: Maybe<MetrologyControlType>;
  organization: Maybe<Scalars['String']['output']>;
  protocolNumber: Maybe<Scalars['String']['output']>;
  result: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  validUntil: Maybe<Scalars['String']['output']>;
  verificationOrganization: Maybe<VerificationOrganization>;
};

export type VerificationRisksResponse = {
  __typename: 'VerificationRisksResponse';
  cities: Array<RiskCityData>;
};

export type VerificationTableItem = {
  __typename: 'VerificationTableItem';
  date: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metrologyControleType: Maybe<MetrologyControlType>;
  protocolNumber: Maybe<Scalars['String']['output']>;
  validUntil: Maybe<Scalars['String']['output']>;
};

export type GetFinancialAnalyticsQueryVariables = Exact<{
  year: Scalars['Int']['input'];
  month?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetFinancialAnalyticsQuery = {
  getFinancialAnalytics: {
    __typename: 'FinancialAnalyticsResponse';
    totalSpent: number;
    monthlyTimeline: Array<{
      __typename: 'FinancialMonthlyTimeline';
      month: number;
      amount: number;
    }>;
    byCities: Array<{
      __typename: 'FinancialByCity';
      cityName: string;
      amount: number;
    }>;
    byCompanies: Array<{
      __typename: 'FinancialByCompany';
      companyName: string;
      amount: number;
    }>;
    byProductionSites: Array<{
      __typename: 'FinancialByProductionSite';
      siteId: string;
      fullSiteLabel: string;
      amount: number;
    }>;
  };
};

export type GetAdminDashboardStatsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetAdminDashboardStatsQuery = {
  getAdminDashboardStats: {
    __typename: 'AdminDashboardResponse';
    stats: {
      __typename: 'AdminStats';
      devices: number;
      users: number;
      companies: number;
      sites: number;
      standards: number;
      tariffs: number;
    };
    anomalies: {
      __typename: 'AdminAnomalies';
      missingMpi: Array<{
        __typename: 'AnomalyDevice';
        id: string;
        name: string;
        model: string;
        serialNumber: string;
      }>;
      missingControlType: Array<{
        __typename: 'AnomalyDevice';
        id: string;
        name: string;
        model: string;
        serialNumber: string;
      }>;
      missingHistory: Array<{
        __typename: 'AnomalyDevice';
        id: string;
        name: string;
        model: string;
        serialNumber: string;
      }>;
      statusMismatch: Array<{
        __typename: 'AnomalyDevice';
        id: string;
        name: string;
        model: string;
        serialNumber: string;
      }>;
    };
  };
};

export type SyncDeviceWithArshinMutationVariables = Exact<{
  input: SyncDeviceWithArshinInput;
}>;

export type SyncDeviceWithArshinMutation = {
  syncDeviceWithArshin: { __typename: 'Device'; id: string; name: string };
};

export type SyncBatchWithArshinMutationVariables = Exact<{
  batchId: Scalars['ID']['input'];
}>;

export type SyncBatchWithArshinMutation = {
  syncBatchWithArshin: {
    __typename: 'QueuedJobResponse';
    jobId: string;
    batchId: string | null;
    message: string;
  };
};

export type GetDeviceAuditLogsQueryVariables = Exact<{
  filter?: InputMaybe<AuditLogFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetDeviceAuditLogsQuery = {
  deviceAuditLogs: {
    __typename: 'AuditLogsResponse';
    totalCount: number;
    items: Array<{
      __typename: 'AuditLog';
      id: string;
      deviceId: string;
      action: AuditAction;
      description: string;
      oldData: string | null;
      newData: string | null;
      createdAt: string;
      user: {
        __typename: 'User';
        id: string;
        firstName: string;
        lastName: string;
        role: string;
        login: string;
      } | null;
    }>;
  };
};

export type DeleteLogMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteLogMutation = { deleteLog: boolean };

export type GetMeQueryVariables = Exact<{ [key: string]: never }>;

export type GetMeQuery = {
  me: {
    __typename: 'User';
    id: string;
    firstName: string;
    lastName: string;
    login: string;
    role: string;
  } | null;
};

export type LoginMutationVariables = Exact<{
  input: LoginUserInput;
}>;

export type LoginMutation = {
  login: {
    __typename: 'AuthPayload';
    success: boolean;
    user: {
      __typename: 'User';
      id: string;
      firstName: string;
      lastName: string;
      login: string;
      role: string;
    } | null;
  };
};

export type RegisterMutationVariables = Exact<{
  input: CreateUserInput;
}>;

export type RegisterMutation = {
  register: {
    __typename: 'AuthPayload';
    success: boolean;
    user: {
      __typename: 'User';
      id: string;
      firstName: string;
      lastName: string;
      login: string;
      role: string;
    } | null;
  };
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { logout: boolean };

export type GetBudgetMatrixQueryVariables = Exact<{
  targetYear: Scalars['Int']['input'];
  groupBy: BudgetGroupBy;
  companyId?: InputMaybe<Scalars['ID']['input']>;
  cityId?: InputMaybe<Scalars['ID']['input']>;
  siteId?: InputMaybe<Scalars['ID']['input']>;
}>;

export type GetBudgetMatrixQuery = {
  getBudgetMatrix: {
    __typename: 'BudgetMatrixResponse';
    targetYear: number;
    grandTotal: number;
    rows: Array<{
      __typename: 'BudgetRow';
      rowId: string;
      rowName: string;
      totalYearCost: number;
      months: Array<{
        __typename: 'BudgetMonthData';
        month: number;
        totalCost: number;
      }>;
    }>;
  };
};

export type GetBudgetPlansQueryVariables = Exact<{ [key: string]: never }>;

export type GetBudgetPlansQuery = {
  budgetPlans: Array<{
    __typename: 'BudgetPlan';
    id: string;
    year: number;
    status: string;
    comment: string | null;
    createdAt: string;
  }>;
};

export type GetBudgetPlanQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetBudgetPlanQuery = {
  budgetPlan: {
    __typename: 'BudgetPlan';
    id: string;
    year: number;
    status: string;
    comment: string | null;
  } | null;
};

export type GetBudgetPlanItemsQueryVariables = Exact<{
  budgetId: Scalars['ID']['input'];
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
  filter?: InputMaybe<BudgetPlanFilterInput>;
}>;

export type GetBudgetPlanItemsQuery = {
  budgetPlanItems: {
    __typename: 'BudgetPlanItemsResponse';
    totalCount: number;
    totalCostAll: number;
    items: Array<{
      __typename: 'BudgetPlanItem';
      id: string;
      deviceName: string;
      deviceModel: string;
      matchMethod: string;
      basePrice: number;
      vatAmount: number;
      totalCost: number;
      device: {
        __typename: 'Device';
        id: string;
        serialNumber: string;
        grsiNumber: string | null;
      };
    }>;
  };
};

export type GetBudgetPlanDetailsQueryVariables = Exact<{
  budgetId: Scalars['ID']['input'];
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
  filter?: InputMaybe<BudgetPlanFilterInput>;
}>;

export type GetBudgetPlanDetailsQuery = {
  budgetPlan: {
    __typename: 'BudgetPlan';
    id: string;
    year: number;
    status: string;
    comment: string | null;
  } | null;
  budgetPlanItems: {
    __typename: 'BudgetPlanItemsResponse';
    totalCount: number;
    totalCostAll: number;
    items: Array<{
      __typename: 'BudgetPlanItem';
      id: string;
      deviceName: string;
      deviceModel: string;
      matchMethod: string;
      basePrice: number;
      vatAmount: number;
      totalCost: number;
      matchHistorySku: string | null;
      device: {
        __typename: 'Device';
        id: string;
        serialNumber: string;
        grsiNumber: string | null;
      };
    }>;
  };
};

export type GetPricelistsQueryVariables = Exact<{ [key: string]: never }>;

export type GetPricelistsQuery = {
  pricelists: Array<{
    __typename: 'Pricelist';
    id: string;
    verificationOrganizationId: string;
    title: string;
    year: number;
    isRegulated: boolean;
    createdAt: string;
    verificationOrganization: {
      __typename: 'VerificationOrganizationRelation';
      id: string;
      name: string;
    };
  }>;
};

export type GetPricelistQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetPricelistQuery = {
  pricelist: {
    __typename: 'Pricelist';
    id: string;
    title: string;
    year: number;
    isRegulated: boolean;
  } | null;
};

export type CreateBudgetPlanMutationVariables = Exact<{
  input: CreateBudgetPlanInput;
}>;

export type CreateBudgetPlanMutation = {
  createBudgetPlan: {
    __typename: 'BudgetPlan';
    id: string;
    year: number;
    status: string;
    comment: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export type UpdateBudgetPlanItemPriceMutationVariables = Exact<{
  input: UpdateBudgetPlanItemPriceInput;
}>;

export type UpdateBudgetPlanItemPriceMutation = {
  updateBudgetPlanItemPrice: {
    __typename: 'BudgetPlanItem';
    id: string;
    basePrice: number;
    vatAmount: number;
    totalCost: number;
    matchMethod: string;
  };
};

export type ApproveBudgetPlanMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type ApproveBudgetPlanMutation = {
  approveBudgetPlan: { __typename: 'BudgetPlan'; id: string; status: string };
};

export type DeleteBudgetPlanMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteBudgetPlanMutation = { deleteBudgetPlan: boolean };

export type CreatePricelistMutationVariables = Exact<{
  input: CreatePricelistInput;
}>;

export type CreatePricelistMutation = {
  createPricelist: {
    __typename: 'QueuedJobResponse';
    jobId: string;
    itemCount: number | null;
    message: string;
  };
};

export type DeletePricelistMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeletePricelistMutation = { deletePricelist: boolean };

export type GetBudgetPlanDistributionQueryVariables = Exact<{
  budgetId: Scalars['ID']['input'];
  groupBy: Scalars['String']['input'];
}>;

export type GetBudgetPlanDistributionQuery = {
  getBudgetPlanDistribution: Array<{
    __typename: 'BudgetPlanDistributionRow';
    groupId: string;
    groupName: string;
    count: number;
    baseSubtotal: number;
    totalCost: number;
  }>;
};

export type GetCsmTariffTrendQueryVariables = Exact<{
  siteId: Scalars['String']['input'];
}>;

export type GetCsmTariffTrendQuery = {
  getCsmTariffTrend: {
    __typename: 'CsmTariffTrendResponse';
    serviceName: string;
    timeline: Array<{
      __typename: 'CsmTariffTimelinePoint';
      year: number;
      price: number;
      csmName: string;
    }>;
  };
};

export type GetVerificationRisksQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetVerificationRisksQuery = {
  getVerificationRisks: {
    __typename: 'VerificationRisksResponse';
    cities: Array<{
      __typename: 'RiskCityData';
      id: string;
      name: string;
      status: string;
      totalCount: number;
      expiredCount: number;
      warningCount: number;
      companies: Array<{
        __typename: 'RiskCompanyData';
        id: string;
        name: string;
        status: string;
        totalCount: number;
        expiredCount: number;
        warningCount: number;
        sites: Array<{
          __typename: 'RiskSiteData';
          id: string;
          name: string;
          status: string;
          totalCount: number;
          expiredCount: number;
          warningCount: number;
        }>;
      }>;
    }>;
  };
};

export type GetChatHistoryQueryVariables = Exact<{
  recipientId: Scalars['ID']['input'];
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
}>;

export type GetChatHistoryQuery = {
  getChatHistory: Array<{
    __typename: 'ChatMessage';
    id: string;
    senderId: string;
    recipientId: string;
    text: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetChatDialogsQueryVariables = Exact<{ [key: string]: never }>;

export type GetChatDialogsQuery = {
  getChatDialogs: Array<{
    __typename: 'ChatDialog';
    companionId: string;
    companionName: string;
    lastMessageText: string;
    unreadCount: number;
    lastMessageCreatedAt: string;
  }>;
};

export type GetTotalUnreadCountQueryVariables = Exact<{ [key: string]: never }>;

export type GetTotalUnreadCountQuery = { getTotalUnreadCount: number };

export type MarkAsReadMutationVariables = Exact<{
  senderId: Scalars['ID']['input'];
}>;

export type MarkAsReadMutation = { markAsRead: boolean };

export type GetSitiesQueryVariables = Exact<{ [key: string]: never }>;

export type GetSitiesQuery = {
  cities: Array<{
    __typename: 'City';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetCityQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetCityQuery = {
  city: {
    __typename: 'City';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type CreateCityMutationVariables = Exact<{
  input: CreateCityInput;
}>;

export type CreateCityMutation = {
  createCity: {
    __typename: 'City';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeleteCityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteCityMutation = { deleteCity: boolean };

export type UpdateCityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateCityInput;
}>;

export type UpdateCityMutation = {
  updateCity: {
    __typename: 'City';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type GetCompaniesQueryVariables = Exact<{ [key: string]: never }>;

export type GetCompaniesQuery = {
  companies: Array<{
    __typename: 'Company';
    id: string;
    name: string;
    address: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetCompanyQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetCompanyQuery = {
  company: {
    __typename: 'Company';
    id: string;
    name: string;
    address: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export type CreateCompanyMutationVariables = Exact<{
  input: CreateCompanyInput;
}>;

export type CreateCompanyMutation = {
  createCompany: {
    __typename: 'Company';
    id: string;
    name: string;
    address: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export type UpdateCompanyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateCompanyInput;
}>;

export type UpdateCompanyMutation = {
  updateCompany: {
    __typename: 'Company';
    id: string;
    name: string;
    address: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeleteCompanyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteCompanyMutation = { deleteCompany: boolean };

export type CreateDeviceMutationVariables = Exact<{
  input: CreateDeviceInput;
}>;

export type CreateDeviceMutation = {
  createDevice: {
    __typename: 'Device';
    id: string;
    name: string;
    model: string;
    serialNumber: string;
    releaseDate: string | null;
    grsiNumber: string | null;
    measurementRange: string | null;
    accuracy: string | null;
    csmCode: string | null;
    inventoryNumber: string | null;
    receiptDate: string | null;
    manufacturer: string | null;
    verificationInterval: number | null;
    archived: boolean;
    nomenclature: string | null;
    comment: string | null;
    statusId: string;
    productionSiteId: string;
    equipmentTypeId: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export type GetDevicesListQueryVariables = Exact<{ [key: string]: never }>;

export type GetDevicesListQuery = {
  devices: Array<{
    __typename: 'Device';
    id: string;
    name: string;
    model: string;
    serialNumber: string;
    releaseDate: string | null;
    grsiNumber: string | null;
    measurementRange: string | null;
    accuracy: string | null;
    inventoryNumber: string | null;
    receiptDate: string | null;
    manufacturer: string | null;
    verificationInterval: number | null;
    archived: boolean;
    nomenclature: string | null;
    comment: string | null;
    statusId: string;
    productionSiteId: string;
    equipmentTypeId: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetDevicesWithRelationsListQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
  filter?: InputMaybe<DeviceFilterInput>;
}>;

export type GetDevicesWithRelationsListQuery = {
  devicesWithRelations: {
    __typename: 'DevicesWithRelationsResponse';
    totalCount: number;
    items: Array<{
      __typename: 'DeviceTableItem';
      id: string;
      name: string;
      model: string;
      serialNumber: string;
      releaseDate: string | null;
      grsiNumber: string | null;
      inventoryNumber: string | null;
      receiptDate: string | null;
      manufacturer: string | null;
      archived: boolean | null;
      status: { __typename: 'Status'; name: string };
      productionSite: {
        __typename: 'ProductionSiteRelation';
        name: string;
        city: { __typename: 'City'; name: string };
        company: { __typename: 'Company'; name: string };
      };
      latestVerification: {
        __typename: 'VerificationTableItem';
        id: string;
        date: string | null;
        validUntil: string | null;
        protocolNumber: string | null;
        metrologyControleType: {
          __typename: 'MetrologyControlType';
          name: string;
        } | null;
      } | null;
    }>;
  };
};

export type GetDeviceWithRelationQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetDeviceWithRelationQuery = {
  device: {
    __typename: 'DeviceWithRelations';
    id: string;
    name: string;
    model: string;
    serialNumber: string;
    releaseDate: string | null;
    grsiNumber: string | null;
    measurementRange: string | null;
    accuracy: string | null;
    csmCode: string | null;
    inventoryNumber: string | null;
    receiptDate: string | null;
    manufacturer: string | null;
    verificationInterval: number | null;
    archived: boolean;
    nomenclature: string | null;
    comment: string | null;
    equipmentType: {
      __typename: 'EquipmentType';
      id: string;
      name: string;
    } | null;
    status: { __typename: 'Status'; id: string; name: string };
    productionSite: {
      __typename: 'ProductionSiteRelation';
      id: string;
      name: string;
      city: { __typename: 'City'; id: string; name: string };
      company: { __typename: 'Company'; id: string; name: string };
    };
    verifications: Array<{
      __typename: 'VerificationRelation';
      id: string;
      date: string | null;
      validUntil: string | null;
      result: string | null;
      protocolNumber: string | null;
      organization: string | null;
      comment: string | null;
      deviceId: string;
      documentUrl: string | null;
      cost: number | null;
      metrologyControleType: {
        __typename: 'MetrologyControlType';
        id: string;
        name: string;
      } | null;
      verificationOrganization: {
        __typename: 'VerificationOrganization';
        id: string;
        name: string;
      } | null;
    }>;
    scopes: Array<{ __typename: 'Scope'; id: string; name: string }>;
    primaryStandarts: Array<{
      __typename: 'PrimaryStandart';
      id: string;
      name: string;
    }>;
    measurementTypes: Array<{
      __typename: 'MeasurementType';
      id: string;
      name: string;
    }>;
  } | null;
};

export type DeleteDeviceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteDeviceMutation = { deleteDevice: boolean };

export type UpdateDeviceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateDeviceInput;
}>;

export type UpdateDeviceMutation = {
  updateDevice: {
    __typename: 'Device';
    id: string;
    name: string;
    model: string;
    serialNumber: string;
    releaseDate: string | null;
    grsiNumber: string | null;
    measurementRange: string | null;
    accuracy: string | null;
    csmCode: string | null;
    inventoryNumber: string | null;
    receiptDate: string | null;
    manufacturer: string | null;
    verificationInterval: number | null;
    archived: boolean;
    nomenclature: string | null;
    comment: string | null;
    statusId: string;
    productionSiteId: string;
    equipmentTypeId: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export type CreateVerificationMutationVariables = Exact<{
  input: CreateVerificationInput;
}>;

export type CreateVerificationMutation = {
  createVerification: {
    __typename: 'VerificationModal';
    id: string;
    deviceId: string;
    protocolNumber: string;
    result: string;
    date: string;
    validUntil: string | null;
    cost: number | null;
    metrologyControleTypeId: string;
    verificationOrganizationId: string;
    comment: string | null;
  };
};

export type ImportDevicesFromExcelMutationVariables = Exact<{
  input: Array<ImportDeviceItemInput> | ImportDeviceItemInput;
}>;

export type ImportDevicesFromExcelMutation = {
  importDevicesFromExcel: {
    __typename: 'QueuedJobResponse';
    jobId: string;
    itemCount: number | null;
    message: string;
  };
};

export type ExecuteRawSqlQueryVariables = Exact<{
  sqlQuery: Scalars['String']['input'];
}>;

export type ExecuteRawSqlQuery = {
  executeRawSql: {
    __typename: 'RawSqlResponse';
    success: boolean;
    columns: Array<string>;
    rows: Array<unknown>;
    affectedRows: number | null;
    errorMessage: string | null;
  };
};

export type GetDevicesBarcodeDataQueryVariables = Exact<{
  ids: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;

export type GetDevicesBarcodeDataQuery = {
  getDevicesBarcodeData: Array<{
    __typename: 'DeviceBarcodeData';
    id: string;
    name: string;
    model: string;
    serialNumber: string;
    statusName: string | null;
    controlType: string | null;
    validUntil: string | null;
  }>;
};

export type GetEquipmentTypesListQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetEquipmentTypesListQuery = {
  equipmentTypes: Array<{
    __typename: 'EquipmentType';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetEquipmentTypeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetEquipmentTypeQuery = {
  equipmentType: {
    __typename: 'EquipmentType';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type CreateEquipmentTypeMutationVariables = Exact<{
  input: CreateEquipmentTypeInput;
}>;

export type CreateEquipmentTypeMutation = {
  createEquipmentType: {
    __typename: 'EquipmentType';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeleteEquipmentTypeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteEquipmentTypeMutation = { deleteEquipmentType: boolean };

export type GetMeasurementTypesListQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetMeasurementTypesListQuery = {
  measurementTypes: Array<{
    __typename: 'MeasurementType';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetMeasurementTypeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetMeasurementTypeQuery = {
  measurementType: {
    __typename: 'MeasurementType';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type CreateMeasurementTypeMutationVariables = Exact<{
  input: CreateMeasurementTypeInput;
}>;

export type CreateMeasurementTypeMutation = {
  createMeasurementType: {
    __typename: 'MeasurementType';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeleteMeasurementTypeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteMeasurementTypeMutation = { deleteMeasurementType: boolean };

export type GetMetrologyControlTypesListQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetMetrologyControlTypesListQuery = {
  metrologyControlTypes: Array<{
    __typename: 'MetrologyControlType';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetMetrologyControlTypeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetMetrologyControlTypeQuery = {
  metrologyControlType: {
    __typename: 'MetrologyControlType';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type CreateMetrologyControlTypeMutationVariables = Exact<{
  input: CreateMetrologyControlTypeInput;
}>;

export type CreateMetrologyControlTypeMutation = {
  createMetrologyControlType: {
    __typename: 'MetrologyControlType';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeleteMetrologyControlTypeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteMetrologyControlTypeMutation = {
  deleteMetrologyControlType: boolean;
};

export type GetSystemNotificationsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetSystemNotificationsQuery = {
  getSystemNotifications: Array<{
    __typename: 'SystemNotification';
    id: string;
    userId: string | null;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }>;
};

export type GetUnreadNotificationsCountQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetUnreadNotificationsCountQuery = {
  getUnreadNotificationsCount: number;
};

export type MarkAllNotificationsAsReadMutationVariables = Exact<{
  [key: string]: never;
}>;

export type MarkAllNotificationsAsReadMutation = {
  markAllNotificationsAsRead: boolean;
};

export type MarkNotificationAsReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type MarkNotificationAsReadMutation = {
  markNotificationAsRead: boolean;
};

export type GetYearlySummaryQueryVariables = Exact<{
  year: Scalars['Int']['input'];
  companyDefaultLeadTime?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetYearlySummaryQuery = {
  getYearlyCalendarSummary: Array<{
    __typename: 'MonthlySummary';
    month: string;
    autoCount: number;
    manualCount: number;
  }>;
};

export type GetPlanningPoolQueryVariables = Exact<{
  targetMonth: Scalars['String']['input'];
  companyDefaultLeadTime?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  controlTypeId?: InputMaybe<Scalars['String']['input']>;
}>;

export type GetPlanningPoolQuery = {
  getPlanningPoolByMonth: {
    __typename: 'PlanningPoolResponse';
    totalCount: number;
    items: Array<{
      __typename: 'PlanningPoolItem';
      id: string;
      name: string;
      model: string;
      serialNumber: string;
      validUntil: string | null;
      suggestedMonth: string;
      targetBatchId: string | null;
      isManualPlacement: boolean;
      controlType: string;
      isOverdue: boolean;
    }>;
    meta: {
      __typename: 'PoolMeta';
      unassignedCount: number;
      typeCounts: Array<{
        __typename: 'PoolMetaTypeCounts';
        typeName: string;
        count: number;
      }>;
    };
  };
};

export type GetVerificationBatchesQueryVariables = Exact<{
  year?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
}>;

export type GetVerificationBatchesQuery = {
  getVerificationBatches: Array<{
    __typename: 'VerificationBatch';
    id: string;
    number: string;
    status: string;
    plannedDate: string;
    comment: string | null;
    devicesToBatches: Array<{
      __typename: 'DeviceToBatchRelation';
      id: string;
      device: {
        __typename: 'DeviceInBatch';
        id: string;
        name: string;
        model: string;
        serialNumber: string;
        verifications: Array<{
          __typename: 'ShortVerification';
          id: string;
          batchId: string | null;
        }> | null;
      };
    }>;
  }>;
};

export type GetDraftBatchesByMonthQueryVariables = Exact<{
  plannedMonth: Scalars['String']['input'];
}>;

export type GetDraftBatchesByMonthQuery = {
  getDraftBatchesByMonth: Array<{
    __typename: 'DraftBatchOption';
    id: string;
    number: string;
  }>;
};

export type CreateVerificationBatchMutationVariables = Exact<{
  input: CreateBatchInput;
}>;

export type CreateVerificationBatchMutation = {
  createVerificationBatch: {
    __typename: 'VerificationBatch';
    id: string;
    number: string;
    status: string;
    plannedDate: string;
  };
};

export type AddDevicesToBatchMutationVariables = Exact<{
  batchId: Scalars['ID']['input'];
  deviceIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;

export type AddDevicesToBatchMutation = { addDevicesToBatch: boolean };

export type RemoveDevicesFromBatchMutationVariables = Exact<{
  batchId: Scalars['ID']['input'];
  deviceIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;

export type RemoveDevicesFromBatchMutation = {
  removeDevicesFromBatch: boolean;
};

export type UpdateBatchStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: Scalars['String']['input'];
}>;

export type UpdateBatchStatusMutation = {
  updateBatchStatus: {
    __typename: 'VerificationBatch';
    id: string;
    number: string;
    status: string;
    updatedAt: string;
  };
};

export type DeleteVerificationBatchMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteVerificationBatchMutation = {
  deleteVerificationBatch: boolean;
};

export type GetPrimaryStandartsListQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetPrimaryStandartsListQuery = {
  primaryStandarts: Array<{
    __typename: 'PrimaryStandart';
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetPrimaryStandartQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetPrimaryStandartQuery = {
  primaryStandart: {
    __typename: 'PrimaryStandart';
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export type CreatePrimaryStandartMutationVariables = Exact<{
  input: CreatePrimaryStandartInput;
}>;

export type CreatePrimaryStandartMutation = {
  createPrimaryStandart: {
    __typename: 'PrimaryStandart';
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeletePrimaryStandartMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeletePrimaryStandartMutation = { deletePrimaryStandart: boolean };

export type GetProductionAnalyticsQueryVariables = Exact<{
  year: Scalars['Int']['input'];
  month?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetProductionAnalyticsQuery = {
  getProductionAnalytics: {
    __typename: 'ProductionAnalyticsResponse';
    totalVerified: number;
    totalRejected: number;
    totalCalibrated: number;
    byProductionSites: Array<{
      __typename: 'QuantitiveItem';
      label: string;
      count: number;
    }>;
    byCompanies: Array<{
      __typename: 'QuantitiveItem';
      label: string;
      count: number;
    }>;
    byCities: Array<{
      __typename: 'QuantitiveItem';
      label: string;
      count: number;
    }>;
  };
};

export type GetProductionSitesQueryVariables = Exact<{ [key: string]: never }>;

export type GetProductionSitesQuery = {
  productionSites: Array<{
    __typename: 'ProductionSiteSelectOption';
    id: string;
    name: string;
    cityId: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type CreateProductionSiteMutationVariables = Exact<{
  input: CreateProductionSiteInput;
}>;

export type CreateProductionSiteMutation = {
  createProductionSite: {
    __typename: 'ProductionSite';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeleteProductionSiteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteProductionSiteMutation = { deleteProductionSite: boolean };

export type GetProductionSitesForSelectQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetProductionSitesForSelectQuery = {
  getProductionSitesForSelect: Array<{
    __typename: 'ProductionSite';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetScopesListQueryVariables = Exact<{ [key: string]: never }>;

export type GetScopesListQuery = {
  scopes: Array<{
    __typename: 'Scope';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetScopeQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetScopeQuery = {
  scope: {
    __typename: 'Scope';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type CreateScopeMutationVariables = Exact<{
  input: CreateScopeInput;
}>;

export type CreateScopeMutation = {
  createScope: {
    __typename: 'Scope';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeleteScopeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteScopeMutation = { deleteScope: boolean };

export type GetStatusListQueryVariables = Exact<{ [key: string]: never }>;

export type GetStatusListQuery = {
  statuses: Array<{
    __typename: 'Status';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetStatusQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetStatusQuery = {
  status: {
    __typename: 'Status';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type CreateStatusMutationVariables = Exact<{
  input: CreateStatusInput;
}>;

export type CreateStatusMutation = {
  createStatus: {
    __typename: 'Status';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeleteStatusMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteStatusMutation = { deleteStatus: boolean };

export type GetUsersQueryVariables = Exact<{ [key: string]: never }>;

export type GetUsersQuery = {
  users: Array<{
    __typename: 'User';
    id: string;
    firstName: string;
    lastName: string;
    login: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetChatUsersQueryVariables = Exact<{ [key: string]: never }>;

export type GetChatUsersQuery = {
  getChatUsers: Array<{
    __typename: 'User';
    id: string;
    firstName: string;
    lastName: string;
    login: string;
    role: string;
  }>;
};

export type GetUserQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetUserQuery = {
  user: {
    __typename: 'User';
    id: string;
    firstName: string;
    lastName: string;
    login: string;
    role: string;
  };
};

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteUserMutation = { deleteUser: boolean };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
}>;

export type UpdateUserMutation = {
  updateUser: {
    __typename: 'User';
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    updatedAt: string;
  };
};

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;

export type CreateUserMutation = {
  createUser: {
    __typename: 'User';
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type GetVerificationOrganizationsListQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetVerificationOrganizationsListQuery = {
  verificationOrganizations: Array<{
    __typename: 'VerificationOrganization';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetVerificationOrganizationQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetVerificationOrganizationQuery = {
  verificationOrganization: {
    __typename: 'VerificationOrganization';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type CreateVerificationOrganizationMutationVariables = Exact<{
  input: CreateVerificationOrganizationInput;
}>;

export type CreateVerificationOrganizationMutation = {
  createVerificationOrganization: {
    __typename: 'VerificationOrganization';
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type DeleteVerificationOrganizationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteVerificationOrganizationMutation = {
  deleteVerificationOrganization: boolean;
};

export const GetFinancialAnalyticsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetFinancialAnalytics' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'year' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'month' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getFinancialAnalytics' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'year' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'year' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'month' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'month' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'totalSpent' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'monthlyTimeline' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'month' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'amount' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'byCities' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'cityName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'amount' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'byCompanies' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'companyName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'amount' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'byProductionSites' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'siteId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'fullSiteLabel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'amount' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetFinancialAnalyticsQuery,
  GetFinancialAnalyticsQueryVariables
>;
export const GetAdminDashboardStatsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAdminDashboardStats' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getAdminDashboardStats' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'stats' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'devices' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'users' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'companies' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'sites' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'standards' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'tariffs' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'anomalies' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'missingMpi' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'model' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'serialNumber' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'missingControlType' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'model' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'serialNumber' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'missingHistory' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'model' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'serialNumber' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'statusMismatch' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'model' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'serialNumber' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAdminDashboardStatsQuery,
  GetAdminDashboardStatsQueryVariables
>;
export const SyncDeviceWithArshinDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SyncDeviceWithArshin' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'SyncDeviceWithArshinInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'syncDeviceWithArshin' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SyncDeviceWithArshinMutation,
  SyncDeviceWithArshinMutationVariables
>;
export const SyncBatchWithArshinDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SyncBatchWithArshin' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'batchId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'syncBatchWithArshin' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'batchId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'batchId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'jobId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'batchId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SyncBatchWithArshinMutation,
  SyncBatchWithArshinMutationVariables
>;
export const GetDeviceAuditLogsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetDeviceAuditLogs' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'AuditLogFilter' },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'offset' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deviceAuditLogs' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'offset' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'offset' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'deviceId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'action' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'oldData' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'newData' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'user' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'firstName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'lastName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'role' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'login' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'totalCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetDeviceAuditLogsQuery,
  GetDeviceAuditLogsQueryVariables
>;
export const DeleteLogDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteLog' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteLog' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteLogMutation, DeleteLogMutationVariables>;
export const GetMeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'getMe' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'me' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;
export const LoginDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Login' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'LoginUserInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'login' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'firstName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Register' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateUserInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'register' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'firstName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lastName' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const LogoutDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Logout' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'logout' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const GetBudgetMatrixDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetBudgetMatrix' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'targetYear' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'groupBy' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'BudgetGroupBy' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'companyId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'cityId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'siteId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getBudgetMatrix' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'targetYear' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'targetYear' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'groupBy' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'groupBy' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'companyId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'companyId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'cityId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'cityId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'siteId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'siteId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'targetYear' } },
                { kind: 'Field', name: { kind: 'Name', value: 'grandTotal' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'rows' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'rowId' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'rowName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'totalYearCost' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'months' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'month' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'totalCost' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetBudgetMatrixQuery,
  GetBudgetMatrixQueryVariables
>;
export const GetBudgetPlansDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetBudgetPlans' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'budgetPlans' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetBudgetPlansQuery, GetBudgetPlansQueryVariables>;
export const GetBudgetPlanDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetBudgetPlan' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'budgetPlan' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetBudgetPlanQuery, GetBudgetPlanQueryVariables>;
export const GetBudgetPlanItemsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetBudgetPlanItems' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'budgetId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'offset' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'BudgetPlanFilterInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'budgetPlanItems' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'budgetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'budgetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'offset' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'offset' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'deviceName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'deviceModel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'matchMethod' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'basePrice' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vatAmount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'totalCost' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'device' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'serialNumber' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'grsiNumber' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'totalCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'totalCostAll' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetBudgetPlanItemsQuery,
  GetBudgetPlanItemsQueryVariables
>;
export const GetBudgetPlanDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetBudgetPlanDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'budgetId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'offset' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'BudgetPlanFilterInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'budgetPlan' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'budgetId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'budgetPlanItems' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'budgetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'budgetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'offset' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'offset' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'deviceName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'deviceModel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'matchMethod' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'basePrice' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'vatAmount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'totalCost' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'matchHistorySku' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'device' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'serialNumber' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'grsiNumber' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'totalCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'totalCostAll' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetBudgetPlanDetailsQuery,
  GetBudgetPlanDetailsQueryVariables
>;
export const GetPricelistsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetPricelists' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'pricelists' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'verificationOrganizationId' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isRegulated' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'verificationOrganization' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetPricelistsQuery, GetPricelistsQueryVariables>;
export const GetPricelistDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetPricelist' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'pricelist' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isRegulated' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetPricelistQuery, GetPricelistQueryVariables>;
export const CreateBudgetPlanDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateBudgetPlan' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateBudgetPlanInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createBudgetPlan' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateBudgetPlanMutation,
  CreateBudgetPlanMutationVariables
>;
export const UpdateBudgetPlanItemPriceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateBudgetPlanItemPrice' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateBudgetPlanItemPriceInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateBudgetPlanItemPrice' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'basePrice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'vatAmount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'matchMethod' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateBudgetPlanItemPriceMutation,
  UpdateBudgetPlanItemPriceMutationVariables
>;
export const ApproveBudgetPlanDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ApproveBudgetPlan' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approveBudgetPlan' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ApproveBudgetPlanMutation,
  ApproveBudgetPlanMutationVariables
>;
export const DeleteBudgetPlanDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteBudgetPlan' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteBudgetPlan' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteBudgetPlanMutation,
  DeleteBudgetPlanMutationVariables
>;
export const CreatePricelistDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreatePricelist' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreatePricelistInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createPricelist' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'jobId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'itemCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreatePricelistMutation,
  CreatePricelistMutationVariables
>;
export const DeletePricelistDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeletePricelist' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deletePricelist' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeletePricelistMutation,
  DeletePricelistMutationVariables
>;
export const GetBudgetPlanDistributionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetBudgetPlanDistribution' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'budgetId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'groupBy' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getBudgetPlanDistribution' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'budgetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'budgetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'groupBy' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'groupBy' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'groupId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'groupName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'baseSubtotal' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'totalCost' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetBudgetPlanDistributionQuery,
  GetBudgetPlanDistributionQueryVariables
>;
export const GetCsmTariffTrendDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCsmTariffTrend' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'siteId' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getCsmTariffTrend' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'siteId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'siteId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'serviceName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'timeline' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'year' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'price' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'csmName' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCsmTariffTrendQuery,
  GetCsmTariffTrendQueryVariables
>;
export const GetVerificationRisksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetVerificationRisks' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getVerificationRisks' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'cities' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'totalCount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'expiredCount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'warningCount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'companies' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'status' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'totalCount' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'expiredCount' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'warningCount' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'sites' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'status' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'totalCount' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'expiredCount',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'warningCount',
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetVerificationRisksQuery,
  GetVerificationRisksQueryVariables
>;
export const GetChatHistoryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetChatHistory' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'recipientId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'offset' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getChatHistory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'recipientId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'recipientId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'offset' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'offset' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'senderId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'recipientId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'text' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isRead' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetChatHistoryQuery, GetChatHistoryQueryVariables>;
export const GetChatDialogsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetChatDialogs' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getChatDialogs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'companionId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'companionName' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'lastMessageText' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'unreadCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'lastMessageCreatedAt' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetChatDialogsQuery, GetChatDialogsQueryVariables>;
export const GetTotalUnreadCountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTotalUnreadCount' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getTotalUnreadCount' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetTotalUnreadCountQuery,
  GetTotalUnreadCountQueryVariables
>;
export const MarkAsReadDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkAsRead' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'senderId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markAsRead' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'senderId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'senderId' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MarkAsReadMutation, MarkAsReadMutationVariables>;
export const GetSitiesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetSities' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'cities' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetSitiesQuery, GetSitiesQueryVariables>;
export const GetCityDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCity' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'city' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCityQuery, GetCityQueryVariables>;
export const CreateCityDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateCity' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateCityInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createCity' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateCityMutation, CreateCityMutationVariables>;
export const DeleteCityDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteCity' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteCity' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteCityMutation, DeleteCityMutationVariables>;
export const UpdateCityDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCity' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateCityInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCity' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateCityMutation, UpdateCityMutationVariables>;
export const GetCompaniesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCompanies' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'companies' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'address' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCompaniesQuery, GetCompaniesQueryVariables>;
export const GetCompanyDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCompany' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'company' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'address' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCompanyQuery, GetCompanyQueryVariables>;
export const CreateCompanyDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateCompany' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateCompanyInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createCompany' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'address' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateCompanyMutation,
  CreateCompanyMutationVariables
>;
export const UpdateCompanyDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCompany' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateCompanyInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCompany' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'address' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateCompanyMutation,
  UpdateCompanyMutationVariables
>;
export const DeleteCompanyDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteCompany' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteCompany' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteCompanyMutation,
  DeleteCompanyMutationVariables
>;
export const CreateDeviceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateDevice' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateDeviceInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createDevice' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'model' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'serialNumber' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'releaseDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'grsiNumber' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'measurementRange' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'accuracy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'csmCode' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'inventoryNumber' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'receiptDate' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'manufacturer' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'verificationInterval' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'archived' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'nomenclature' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'statusId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'productionSiteId' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'equipmentTypeId' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateDeviceMutation,
  CreateDeviceMutationVariables
>;
export const GetDevicesListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetDevicesList' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'devices' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'model' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'serialNumber' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'releaseDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'grsiNumber' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'measurementRange' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'accuracy' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'inventoryNumber' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'receiptDate' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'manufacturer' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'verificationInterval' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'archived' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'nomenclature' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'statusId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'productionSiteId' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'equipmentTypeId' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetDevicesListQuery, GetDevicesListQueryVariables>;
export const GetDevicesWithRelationsListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetDevicesWithRelationsList' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'offset' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'DeviceFilterInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'devicesWithRelations' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'offset' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'offset' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'model' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'serialNumber' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'releaseDate' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'grsiNumber' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'inventoryNumber' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'receiptDate' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'manufacturer' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'archived' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'status' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'productionSite' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'city' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'company' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'latestVerification' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'date' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'validUntil' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'protocolNumber' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'metrologyControleType',
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'name' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'totalCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetDevicesWithRelationsListQuery,
  GetDevicesWithRelationsListQueryVariables
>;
export const GetDeviceWithRelationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetDeviceWithRelation' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'device' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'model' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'serialNumber' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'releaseDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'grsiNumber' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'measurementRange' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'accuracy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'csmCode' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'inventoryNumber' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'receiptDate' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'manufacturer' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'verificationInterval' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'archived' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'nomenclature' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'equipmentType' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'status' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'productionSite' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'city' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'company' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'verifications' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'date' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'validUntil' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'result' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'protocolNumber' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'organization' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'comment' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'deviceId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'documentUrl' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'cost' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'metrologyControleType' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: {
                          kind: 'Name',
                          value: 'verificationOrganization',
                        },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'scopes' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'primaryStandarts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'measurementTypes' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetDeviceWithRelationQuery,
  GetDeviceWithRelationQueryVariables
>;
export const DeleteDeviceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteDevice' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteDevice' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteDeviceMutation,
  DeleteDeviceMutationVariables
>;
export const UpdateDeviceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateDevice' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateDeviceInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateDevice' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'model' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'serialNumber' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'releaseDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'grsiNumber' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'measurementRange' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'accuracy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'csmCode' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'inventoryNumber' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'receiptDate' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'manufacturer' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'verificationInterval' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'archived' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'nomenclature' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'statusId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'productionSiteId' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'equipmentTypeId' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateDeviceMutation,
  UpdateDeviceMutationVariables
>;
export const CreateVerificationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateVerification' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateVerificationInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createVerification' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deviceId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'protocolNumber' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'result' } },
                { kind: 'Field', name: { kind: 'Name', value: 'date' } },
                { kind: 'Field', name: { kind: 'Name', value: 'validUntil' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cost' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'metrologyControleTypeId' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'verificationOrganizationId' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateVerificationMutation,
  CreateVerificationMutationVariables
>;
export const ImportDevicesFromExcelDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ImportDevicesFromExcel' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'ImportDeviceItemInput' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'importDevicesFromExcel' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'jobId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'itemCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ImportDevicesFromExcelMutation,
  ImportDevicesFromExcelMutationVariables
>;
export const ExecuteRawSqlDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ExecuteRawSql' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'sqlQuery' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'executeRawSql' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sqlQuery' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'sqlQuery' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'columns' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rows' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'affectedRows' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'errorMessage' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExecuteRawSqlQuery, ExecuteRawSqlQueryVariables>;
export const GetDevicesBarcodeDataDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetDevicesBarcodeData' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ids' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'ID' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getDevicesBarcodeData' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ids' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'ids' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'model' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'serialNumber' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'statusName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'controlType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'validUntil' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetDevicesBarcodeDataQuery,
  GetDevicesBarcodeDataQueryVariables
>;
export const GetEquipmentTypesListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetEquipmentTypesList' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equipmentTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetEquipmentTypesListQuery,
  GetEquipmentTypesListQueryVariables
>;
export const GetEquipmentTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetEquipmentType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equipmentType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetEquipmentTypeQuery,
  GetEquipmentTypeQueryVariables
>;
export const CreateEquipmentTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateEquipmentType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateEquipmentTypeInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createEquipmentType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateEquipmentTypeMutation,
  CreateEquipmentTypeMutationVariables
>;
export const DeleteEquipmentTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteEquipmentType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteEquipmentType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteEquipmentTypeMutation,
  DeleteEquipmentTypeMutationVariables
>;
export const GetMeasurementTypesListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMeasurementTypesList' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'measurementTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMeasurementTypesListQuery,
  GetMeasurementTypesListQueryVariables
>;
export const GetMeasurementTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMeasurementType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'measurementType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMeasurementTypeQuery,
  GetMeasurementTypeQueryVariables
>;
export const CreateMeasurementTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateMeasurementType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateMeasurementTypeInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createMeasurementType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateMeasurementTypeMutation,
  CreateMeasurementTypeMutationVariables
>;
export const DeleteMeasurementTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteMeasurementType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteMeasurementType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteMeasurementTypeMutation,
  DeleteMeasurementTypeMutationVariables
>;
export const GetMetrologyControlTypesListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMetrologyControlTypesList' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'metrologyControlTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMetrologyControlTypesListQuery,
  GetMetrologyControlTypesListQueryVariables
>;
export const GetMetrologyControlTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMetrologyControlType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'metrologyControlType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMetrologyControlTypeQuery,
  GetMetrologyControlTypeQueryVariables
>;
export const CreateMetrologyControlTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateMetrologyControlType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateMetrologyControlTypeInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createMetrologyControlType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateMetrologyControlTypeMutation,
  CreateMetrologyControlTypeMutationVariables
>;
export const DeleteMetrologyControlTypeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteMetrologyControlType' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteMetrologyControlType' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteMetrologyControlTypeMutation,
  DeleteMetrologyControlTypeMutationVariables
>;
export const GetSystemNotificationsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetSystemNotifications' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getSystemNotifications' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isRead' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetSystemNotificationsQuery,
  GetSystemNotificationsQueryVariables
>;
export const GetUnreadNotificationsCountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetUnreadNotificationsCount' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getUnreadNotificationsCount' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetUnreadNotificationsCountQuery,
  GetUnreadNotificationsCountQueryVariables
>;
export const MarkAllNotificationsAsReadDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkAllNotificationsAsRead' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markAllNotificationsAsRead' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MarkAllNotificationsAsReadMutation,
  MarkAllNotificationsAsReadMutationVariables
>;
export const MarkNotificationAsReadDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkNotificationAsRead' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markNotificationAsRead' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MarkNotificationAsReadMutation,
  MarkNotificationAsReadMutationVariables
>;
export const GetYearlySummaryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetYearlySummary' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'year' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'companyDefaultLeadTime' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getYearlyCalendarSummary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'year' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'year' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'companyDefaultLeadTime' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'companyDefaultLeadTime' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'month' } },
                { kind: 'Field', name: { kind: 'Name', value: 'autoCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'manualCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetYearlySummaryQuery,
  GetYearlySummaryQueryVariables
>;
export const GetPlanningPoolDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetPlanningPool' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'targetMonth' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'companyDefaultLeadTime' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'offset' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'controlTypeId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getPlanningPoolByMonth' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'targetMonth' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'targetMonth' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'companyDefaultLeadTime' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'companyDefaultLeadTime' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'offset' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'offset' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'controlTypeId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'controlTypeId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'model' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'serialNumber' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'validUntil' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'suggestedMonth' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'targetBatchId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'isManualPlacement' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'controlType' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'isOverdue' },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'totalCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'meta' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'unassignedCount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'typeCounts' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'typeName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'count' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPlanningPoolQuery,
  GetPlanningPoolQueryVariables
>;
export const GetVerificationBatchesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetVerificationBatches' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'year' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'status' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getVerificationBatches' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'year' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'year' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'status' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'status' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'plannedDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'devicesToBatches' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'device' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'model' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'serialNumber' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'verifications' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'id' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'batchId' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetVerificationBatchesQuery,
  GetVerificationBatchesQueryVariables
>;
export const GetDraftBatchesByMonthDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetDraftBatchesByMonth' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'plannedMonth' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getDraftBatchesByMonth' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'plannedMonth' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'plannedMonth' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'number' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetDraftBatchesByMonthQuery,
  GetDraftBatchesByMonthQueryVariables
>;
export const CreateVerificationBatchDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateVerificationBatch' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateBatchInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createVerificationBatch' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'plannedDate' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateVerificationBatchMutation,
  CreateVerificationBatchMutationVariables
>;
export const AddDevicesToBatchDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AddDevicesToBatch' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'batchId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'deviceIds' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'ID' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addDevicesToBatch' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'batchId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'batchId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'deviceIds' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'deviceIds' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AddDevicesToBatchMutation,
  AddDevicesToBatchMutationVariables
>;
export const RemoveDevicesFromBatchDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RemoveDevicesFromBatch' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'batchId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'deviceIds' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'ID' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'removeDevicesFromBatch' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'batchId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'batchId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'deviceIds' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'deviceIds' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveDevicesFromBatchMutation,
  RemoveDevicesFromBatchMutationVariables
>;
export const UpdateBatchStatusDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateBatchStatus' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'status' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateBatchStatus' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'status' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'status' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'number' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateBatchStatusMutation,
  UpdateBatchStatusMutationVariables
>;
export const DeleteVerificationBatchDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteVerificationBatch' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteVerificationBatch' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteVerificationBatchMutation,
  DeleteVerificationBatchMutationVariables
>;
export const GetPrimaryStandartsListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetPrimaryStandartsList' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'primaryStandarts' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPrimaryStandartsListQuery,
  GetPrimaryStandartsListQueryVariables
>;
export const GetPrimaryStandartDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetPrimaryStandart' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'primaryStandart' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPrimaryStandartQuery,
  GetPrimaryStandartQueryVariables
>;
export const CreatePrimaryStandartDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreatePrimaryStandart' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreatePrimaryStandartInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createPrimaryStandart' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreatePrimaryStandartMutation,
  CreatePrimaryStandartMutationVariables
>;
export const DeletePrimaryStandartDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeletePrimaryStandart' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deletePrimaryStandart' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeletePrimaryStandartMutation,
  DeletePrimaryStandartMutationVariables
>;
export const GetProductionAnalyticsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetProductionAnalytics' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'year' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'month' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getProductionAnalytics' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'year' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'year' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'month' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'month' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'totalVerified' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'totalRejected' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'totalCalibrated' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'byProductionSites' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'byCompanies' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'byCities' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'label' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'count' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetProductionAnalyticsQuery,
  GetProductionAnalyticsQueryVariables
>;
export const GetProductionSitesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetProductionSites' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'productionSites' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cityId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'companyId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetProductionSitesQuery,
  GetProductionSitesQueryVariables
>;
export const CreateProductionSiteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateProductionSite' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateProductionSiteInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createProductionSite' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateProductionSiteMutation,
  CreateProductionSiteMutationVariables
>;
export const DeleteProductionSiteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteProductionSite' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteProductionSite' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteProductionSiteMutation,
  DeleteProductionSiteMutationVariables
>;
export const GetProductionSitesForSelectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetProductionSitesForSelect' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getProductionSitesForSelect' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetProductionSitesForSelectQuery,
  GetProductionSitesForSelectQueryVariables
>;
export const GetScopesListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetScopesList' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scopes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetScopesListQuery, GetScopesListQueryVariables>;
export const GetScopeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetScope' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'scope' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetScopeQuery, GetScopeQueryVariables>;
export const CreateScopeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateScope' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateScopeInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createScope' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateScopeMutation, CreateScopeMutationVariables>;
export const DeleteScopeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteScope' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteScope' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteScopeMutation, DeleteScopeMutationVariables>;
export const GetStatusListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetStatusList' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'statuses' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetStatusListQuery, GetStatusListQueryVariables>;
export const GetStatusDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetStatus' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'status' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetStatusQuery, GetStatusQueryVariables>;
export const CreateStatusDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateStatus' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateStatusInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createStatus' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateStatusMutation,
  CreateStatusMutationVariables
>;
export const DeleteStatusDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteStatus' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteStatus' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteStatusMutation,
  DeleteStatusMutationVariables
>;
export const GetUsersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetUsers' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'users' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
export const GetChatUsersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetChatUsers' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getChatUsers' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetChatUsersQuery, GetChatUsersQueryVariables>;
export const GetUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'user' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'login' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const DeleteUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteUserMutation, DeleteUserMutationVariables>;
export const UpdateUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateUserInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const CreateUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateUserInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const GetVerificationOrganizationsListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetVerificationOrganizationsList' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'verificationOrganizations' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetVerificationOrganizationsListQuery,
  GetVerificationOrganizationsListQueryVariables
>;
export const GetVerificationOrganizationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetVerificationOrganization' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'verificationOrganization' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetVerificationOrganizationQuery,
  GetVerificationOrganizationQueryVariables
>;
export const CreateVerificationOrganizationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateVerificationOrganization' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'CreateVerificationOrganizationInput',
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createVerificationOrganization' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateVerificationOrganizationMutation,
  CreateVerificationOrganizationMutationVariables
>;
export const DeleteVerificationOrganizationDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteVerificationOrganization' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteVerificationOrganization' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteVerificationOrganizationMutation,
  DeleteVerificationOrganizationMutationVariables
>;
