import type { ColumnType } from "kysely";
import type { IPostgresInterval } from "postgres-interval";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>;

export type Interval = ColumnType<IPostgresInterval, IPostgresInterval | number, IPostgresInterval | number>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Numeric = ColumnType<string, number | string, number | string>;

export type PgbossJobState = "active" | "cancelled" | "completed" | "created" | "expired" | "failed" | "retry";

export type Rewardtype = "leader" | "member" | "refund" | "reserves" | "treasury";

export type Scriptpurposetype = "cert" | "mint" | "reward" | "spend";

export type Scripttype = "multisig" | "plutusV1" | "plutusV2" | "timelock";

export type Syncstatetype = "following" | "lagging";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface AdaPots {
  block_id: Int8;
  deposits: string;
  epoch_no: string;
  fees: string;
  id: Generated<Int8>;
  reserves: string;
  rewards: string;
  slot_no: string;
  treasury: string;
  utxo: string;
}

export interface Asset {
  assetId: Buffer;
  assetName: Buffer | null;
  decimals: number | null;
  description: string | null;
  fingerprint: string | null;
  firstAppearedInSlot: number | null;
  logo: string | null;
  metadataHash: string | null;
  name: string | null;
  policyId: Buffer | null;
  ticker: string | null;
  url: string | null;
}

export interface Block {
  block_no: string | null;
  epoch_no: string | null;
  epoch_slot_no: string | null;
  hash: string;
  id: Generated<Int8>;
  op_cert: string | null;
  op_cert_counter: string | null;
  previous_id: Int8 | null;
  proto_major: string;
  proto_minor: string;
  size: string;
  slot_leader_id: Int8;
  slot_no: string | null;
  time: Timestamp;
  tx_count: Int8;
  vrf_key: string | null;
}

export interface CollateralTxIn {
  id: Generated<Int8>;
  tx_in_id: Int8;
  tx_out_id: Int8;
  tx_out_index: string;
}

export interface CollateralTxOut {
  address: string;
  address_has_script: boolean;
  address_raw: Buffer;
  data_hash: string | null;
  id: Generated<Int8>;
  index: string;
  inline_datum_id: Int8 | null;
  multi_assets_descr: string;
  payment_cred: string | null;
  reference_script_id: Int8 | null;
  stake_address_id: Int8 | null;
  tx_id: Int8;
  value: string;
}

export interface CostModel {
  costs: Json;
  hash: string;
  id: Generated<Int8>;
}

export interface Datum {
  bytes: Buffer;
  hash: string;
  id: Generated<Int8>;
  tx_id: Int8;
  value: Json | null;
}

export interface Delegation {
  active_epoch_no: Int8;
  addr_id: Int8;
  cert_index: number;
  id: Generated<Int8>;
  pool_hash_id: Int8;
  redeemer_id: Int8 | null;
  slot_no: string;
  tx_id: Int8;
}

export interface DelistedPool {
  hash_raw: string;
  id: Generated<Int8>;
}

export interface Epoch {
  blk_count: string;
  end_time: Timestamp;
  fees: string;
  id: Generated<Int8>;
  no: string;
  out_sum: string;
  start_time: Timestamp;
  tx_count: string;
}

export interface EpochParam {
  block_id: Int8;
  coins_per_utxo_size: string | null;
  collateral_percent: string | null;
  cost_model_id: Int8 | null;
  decentralisation: number;
  epoch_no: string;
  extra_entropy: string | null;
  id: Generated<Int8>;
  influence: number;
  key_deposit: string;
  max_bh_size: string;
  max_block_ex_mem: string | null;
  max_block_ex_steps: string | null;
  max_block_size: string;
  max_collateral_inputs: string | null;
  max_epoch: string;
  max_tx_ex_mem: string | null;
  max_tx_ex_steps: string | null;
  max_tx_size: string;
  max_val_size: string | null;
  min_fee_a: string;
  min_fee_b: string;
  min_pool_cost: string;
  min_utxo_value: string;
  monetary_expand_rate: number;
  nonce: string | null;
  optimal_pool_count: string;
  pool_deposit: string;
  price_mem: number | null;
  price_step: number | null;
  protocol_major: string;
  protocol_minor: string;
  treasury_growth_rate: number;
}

export interface EpochStake {
  addr_id: Int8;
  amount: string;
  epoch_no: string;
  id: Generated<Int8>;
  pool_id: Int8;
}

export interface EpochSyncTime {
  id: Generated<Int8>;
  no: Int8;
  seconds: string;
  state: Syncstatetype;
}

export interface ExtraKeyWitness {
  hash: string;
  id: Generated<Int8>;
  tx_id: Int8;
}

export interface HdbCatalogHdbActionLog {
  action_name: string | null;
  created_at: Generated<Timestamp>;
  errors: Json | null;
  id: Generated<string>;
  input_payload: Json;
  request_headers: Json;
  response_payload: Json | null;
  response_received_at: Timestamp | null;
  session_variables: Json;
  status: string;
}

export interface HdbCatalogHdbCronEventInvocationLogs {
  created_at: Generated<Timestamp | null>;
  event_id: string | null;
  id: Generated<string>;
  request: Json | null;
  response: Json | null;
  status: number | null;
}

export interface HdbCatalogHdbCronEvents {
  created_at: Generated<Timestamp | null>;
  id: Generated<string>;
  next_retry_at: Timestamp | null;
  scheduled_time: Timestamp;
  status: Generated<string>;
  tries: Generated<number>;
  trigger_name: string;
}

export interface HdbCatalogHdbMetadata {
  id: number;
  metadata: Json;
  resource_version: Generated<number>;
}

export interface HdbCatalogHdbScheduledEventInvocationLogs {
  created_at: Generated<Timestamp | null>;
  event_id: string | null;
  id: Generated<string>;
  request: Json | null;
  response: Json | null;
  status: number | null;
}

export interface HdbCatalogHdbScheduledEvents {
  comment: string | null;
  created_at: Generated<Timestamp | null>;
  header_conf: Json | null;
  id: Generated<string>;
  next_retry_at: Timestamp | null;
  payload: Json | null;
  retry_conf: Json | null;
  scheduled_time: Timestamp;
  status: Generated<string>;
  tries: Generated<number>;
  webhook_conf: Json;
}

export interface HdbCatalogHdbSchemaNotifications {
  id: number;
  instance_id: string;
  notification: Json;
  resource_version: Generated<number>;
  updated_at: Generated<Timestamp | null>;
}

export interface HdbCatalogHdbVersion {
  cli_state: Generated<Json>;
  console_state: Generated<Json>;
  hasura_uuid: Generated<string>;
  upgraded_on: Timestamp;
  version: string;
}

export interface MaTxMint {
  id: Generated<Int8>;
  ident: Int8;
  quantity: string;
  tx_id: Int8;
}

export interface MaTxOut {
  id: Generated<Int8>;
  ident: Int8;
  quantity: string;
  tx_out_id: Int8;
}

export interface Meta {
  id: Generated<Int8>;
  network_name: string;
  start_time: Timestamp;
  version: string;
}

export interface MultiAsset {
  fingerprint: string;
  id: Generated<Int8>;
  name: string;
  policy: string;
}

export interface ParamProposal {
  coins_per_utxo_size: string | null;
  collateral_percent: string | null;
  cost_model_id: Int8 | null;
  decentralisation: number | null;
  entropy: string | null;
  epoch_no: string;
  id: Generated<Int8>;
  influence: number | null;
  key: string;
  key_deposit: string | null;
  max_bh_size: string | null;
  max_block_ex_mem: string | null;
  max_block_ex_steps: string | null;
  max_block_size: string | null;
  max_collateral_inputs: string | null;
  max_epoch: string | null;
  max_tx_ex_mem: string | null;
  max_tx_ex_steps: string | null;
  max_tx_size: string | null;
  max_val_size: string | null;
  min_fee_a: string | null;
  min_fee_b: string | null;
  min_pool_cost: string | null;
  min_utxo_value: string | null;
  monetary_expand_rate: number | null;
  optimal_pool_count: string | null;
  pool_deposit: string | null;
  price_mem: number | null;
  price_step: number | null;
  protocol_major: string | null;
  protocol_minor: string | null;
  registered_tx_id: Int8;
  treasury_growth_rate: number | null;
}

export interface PgbossArchive {
  archivedon: Generated<Timestamp>;
  completedon: Timestamp | null;
  createdon: Timestamp;
  data: Json | null;
  expirein: Interval;
  id: string;
  keepuntil: Timestamp;
  name: string;
  on_complete: boolean;
  output: Json | null;
  priority: number;
  retrybackoff: boolean;
  retrycount: number;
  retrydelay: number;
  retrylimit: number;
  singletonkey: string | null;
  singletonon: Timestamp | null;
  startafter: Timestamp;
  startedon: Timestamp | null;
  state: PgbossJobState;
}

export interface PgbossJob {
  completedon: Timestamp | null;
  createdon: Generated<Timestamp>;
  data: Json | null;
  expirein: Generated<Interval>;
  id: Generated<string>;
  keepuntil: Generated<Timestamp>;
  name: string;
  on_complete: Generated<boolean>;
  output: Json | null;
  priority: Generated<number>;
  retrybackoff: Generated<boolean>;
  retrycount: Generated<number>;
  retrydelay: Generated<number>;
  retrylimit: Generated<number>;
  singletonkey: string | null;
  singletonon: Timestamp | null;
  startafter: Generated<Timestamp>;
  startedon: Timestamp | null;
  state: Generated<PgbossJobState>;
}

export interface PgbossSchedule {
  created_on: Generated<Timestamp>;
  cron: string;
  data: Json | null;
  name: string;
  options: Json | null;
  timezone: string | null;
  updated_on: Generated<Timestamp>;
}

export interface PgbossVersion {
  cron_on: Timestamp | null;
  maintained_on: Timestamp | null;
  version: number;
}

export interface PgStatStatements {
  blk_read_time: number | null;
  blk_write_time: number | null;
  calls: Int8 | null;
  dbid: number | null;
  local_blks_dirtied: Int8 | null;
  local_blks_hit: Int8 | null;
  local_blks_read: Int8 | null;
  local_blks_written: Int8 | null;
  max_exec_time: number | null;
  max_plan_time: number | null;
  mean_exec_time: number | null;
  mean_plan_time: number | null;
  min_exec_time: number | null;
  min_plan_time: number | null;
  plans: Int8 | null;
  query: string | null;
  queryid: Int8 | null;
  rows: Int8 | null;
  shared_blks_dirtied: Int8 | null;
  shared_blks_hit: Int8 | null;
  shared_blks_read: Int8 | null;
  shared_blks_written: Int8 | null;
  stddev_exec_time: number | null;
  stddev_plan_time: number | null;
  temp_blks_read: Int8 | null;
  temp_blks_written: Int8 | null;
  toplevel: boolean | null;
  total_exec_time: number | null;
  total_plan_time: number | null;
  userid: number | null;
  wal_bytes: Numeric | null;
  wal_fpi: Int8 | null;
  wal_records: Int8 | null;
}

export interface PgStatStatementsInfo {
  dealloc: Int8 | null;
  stats_reset: Timestamp | null;
}

export interface PoolHash {
  hash_raw: string;
  id: Generated<Int8>;
  view: string;
}

export interface PoolMetadataRef {
  hash: string;
  id: Generated<Int8>;
  pool_id: Int8;
  registered_tx_id: Int8;
  url: string;
}

export interface PoolOfflineData {
  bytes: Buffer;
  hash: string;
  id: Generated<Int8>;
  json: Json;
  pmr_id: Int8;
  pool_id: Int8;
  ticker_name: string;
}

export interface PoolOfflineFetchError {
  fetch_error: string;
  fetch_time: Timestamp;
  id: Generated<Int8>;
  pmr_id: Int8;
  pool_id: Int8;
  retry_count: string;
}

export interface PoolOwner {
  addr_id: Int8;
  id: Generated<Int8>;
  pool_update_id: Int8;
}

export interface PoolRelay {
  dns_name: string | null;
  dns_srv_name: string | null;
  id: Generated<Int8>;
  ipv4: string | null;
  ipv6: string | null;
  port: number | null;
  update_id: Int8;
}

export interface PoolRetire {
  announced_tx_id: Int8;
  cert_index: number;
  hash_id: Int8;
  id: Generated<Int8>;
  retiring_epoch: string;
}

export interface PoolUpdate {
  active_epoch_no: Int8;
  cert_index: number;
  fixed_cost: string;
  hash_id: Int8;
  id: Generated<Int8>;
  margin: number;
  meta_id: Int8 | null;
  pledge: string;
  registered_tx_id: Int8;
  reward_addr_id: Int8;
  vrf_key_hash: string;
}

export interface PotTransfer {
  cert_index: number;
  id: Generated<Int8>;
  reserves: string;
  treasury: string;
  tx_id: Int8;
}

export interface Redeemer {
  fee: string | null;
  id: Generated<Int8>;
  index: string;
  purpose: Scriptpurposetype;
  redeemer_data_id: Int8;
  script_hash: string | null;
  tx_id: Int8;
  unit_mem: string;
  unit_steps: string;
}

export interface RedeemerData {
  bytes: Buffer;
  hash: string;
  id: Generated<Int8>;
  tx_id: Int8;
  value: Json | null;
}

export interface ReferenceTxIn {
  id: Generated<Int8>;
  tx_in_id: Int8;
  tx_out_id: Int8;
  tx_out_index: string;
}

export interface Reserve {
  addr_id: Int8;
  amount: string;
  cert_index: number;
  id: Generated<Int8>;
  tx_id: Int8;
}

export interface ReservedPoolTicker {
  id: Generated<Int8>;
  name: string;
  pool_hash: string;
}

export interface ReverseIndex {
  block_id: Int8;
  id: Generated<Int8>;
  min_ids: string | null;
}

export interface Reward {
  addr_id: Int8;
  amount: string;
  earned_epoch: Int8;
  id: Generated<Int8>;
  pool_id: Int8 | null;
  spendable_epoch: Int8;
  type: Rewardtype;
}

export interface SchemaVersion {
  id: Generated<Int8>;
  stage_one: Int8;
  stage_three: Int8;
  stage_two: Int8;
}

export interface Script {
  bytes: Buffer | null;
  hash: string;
  id: Generated<Int8>;
  json: Json | null;
  serialised_size: string | null;
  tx_id: Int8;
  type: Scripttype;
}

export interface SlotLeader {
  description: string;
  hash: string;
  id: Generated<Int8>;
  pool_hash_id: Int8 | null;
}

export interface StakeAddress {
  hash_raw: string;
  id: Generated<Int8>;
  script_hash: string | null;
  view: string;
}

export interface StakeDeregistration {
  addr_id: Int8;
  cert_index: number;
  epoch_no: string;
  id: Generated<Int8>;
  redeemer_id: Int8 | null;
  tx_id: Int8;
}

export interface StakeRegistration {
  addr_id: Int8;
  cert_index: number;
  epoch_no: string;
  id: Generated<Int8>;
  tx_id: Int8;
}

export interface Treasury {
  addr_id: Int8;
  amount: string;
  cert_index: number;
  id: Generated<Int8>;
  tx_id: Int8;
}

export interface Tx {
  block_id: Int8;
  block_index: string;
  deposit: Int8;
  fee: string;
  hash: string;
  id: Generated<Int8>;
  invalid_before: string | null;
  invalid_hereafter: string | null;
  out_sum: string;
  script_size: string;
  size: string;
  valid_contract: boolean;
}

export interface TxIn {
  id: Generated<Int8>;
  redeemer_id: Int8 | null;
  tx_in_id: Int8;
  tx_out_id: Int8;
  tx_out_index: string;
}

export interface TxMetadata {
  bytes: Buffer;
  id: Generated<Int8>;
  json: Json | null;
  key: string;
  tx_id: Int8;
}

export interface TxOut {
  address: string;
  address_has_script: boolean;
  address_raw: Buffer;
  data_hash: string | null;
  id: Generated<Int8>;
  index: string;
  inline_datum_id: Int8 | null;
  payment_cred: string | null;
  reference_script_id: Int8 | null;
  stake_address_id: Int8 | null;
  tx_id: Int8;
  value: string;
}

export interface UtxoByronView {
  address: string | null;
  address_has_script: boolean | null;
  address_raw: Buffer | null;
  data_hash: string | null;
  id: Int8 | null;
  index: string | null;
  inline_datum_id: Int8 | null;
  payment_cred: string | null;
  reference_script_id: Int8 | null;
  stake_address_id: Int8 | null;
  tx_id: Int8 | null;
  value: string | null;
}

export interface UtxoView {
  address: string | null;
  address_has_script: boolean | null;
  address_raw: Buffer | null;
  data_hash: string | null;
  id: Int8 | null;
  index: string | null;
  inline_datum_id: Int8 | null;
  payment_cred: string | null;
  reference_script_id: Int8 | null;
  stake_address_id: Int8 | null;
  tx_id: Int8 | null;
  value: string | null;
}

export interface Withdrawal {
  addr_id: Int8;
  amount: string;
  id: Generated<Int8>;
  redeemer_id: Int8 | null;
  tx_id: Int8;
}

export interface DB {
  ada_pots: AdaPots;
  Asset: Asset;
  block: Block;
  collateral_tx_in: CollateralTxIn;
  collateral_tx_out: CollateralTxOut;
  cost_model: CostModel;
  datum: Datum;
  delegation: Delegation;
  delisted_pool: DelistedPool;
  epoch: Epoch;
  epoch_param: EpochParam;
  epoch_stake: EpochStake;
  epoch_sync_time: EpochSyncTime;
  extra_key_witness: ExtraKeyWitness;
  "hdb_catalog.hdb_action_log": HdbCatalogHdbActionLog;
  "hdb_catalog.hdb_cron_event_invocation_logs": HdbCatalogHdbCronEventInvocationLogs;
  "hdb_catalog.hdb_cron_events": HdbCatalogHdbCronEvents;
  "hdb_catalog.hdb_metadata": HdbCatalogHdbMetadata;
  "hdb_catalog.hdb_scheduled_event_invocation_logs": HdbCatalogHdbScheduledEventInvocationLogs;
  "hdb_catalog.hdb_scheduled_events": HdbCatalogHdbScheduledEvents;
  "hdb_catalog.hdb_schema_notifications": HdbCatalogHdbSchemaNotifications;
  "hdb_catalog.hdb_version": HdbCatalogHdbVersion;
  ma_tx_mint: MaTxMint;
  ma_tx_out: MaTxOut;
  meta: Meta;
  multi_asset: MultiAsset;
  param_proposal: ParamProposal;
  pg_stat_statements: PgStatStatements;
  pg_stat_statements_info: PgStatStatementsInfo;
  "pgboss.archive": PgbossArchive;
  "pgboss.job": PgbossJob;
  "pgboss.schedule": PgbossSchedule;
  "pgboss.version": PgbossVersion;
  pool_hash: PoolHash;
  pool_metadata_ref: PoolMetadataRef;
  pool_offline_data: PoolOfflineData;
  pool_offline_fetch_error: PoolOfflineFetchError;
  pool_owner: PoolOwner;
  pool_relay: PoolRelay;
  pool_retire: PoolRetire;
  pool_update: PoolUpdate;
  pot_transfer: PotTransfer;
  redeemer: Redeemer;
  redeemer_data: RedeemerData;
  reference_tx_in: ReferenceTxIn;
  reserve: Reserve;
  reserved_pool_ticker: ReservedPoolTicker;
  reverse_index: ReverseIndex;
  reward: Reward;
  schema_version: SchemaVersion;
  script: Script;
  slot_leader: SlotLeader;
  stake_address: StakeAddress;
  stake_deregistration: StakeDeregistration;
  stake_registration: StakeRegistration;
  treasury: Treasury;
  tx: Tx;
  tx_in: TxIn;
  tx_metadata: TxMetadata;
  tx_out: TxOut;
  utxo_byron_view: UtxoByronView;
  utxo_view: UtxoView;
  withdrawal: Withdrawal;
}
