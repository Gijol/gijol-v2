// 로컬 스토리지 저장 키 명

// 초기 업로드 시 파싱 및 수정된 처리 전 상태
export const PARSED_EDITABLE_STATE_KEY = 'gijol_parsed_editable_state';

// 파싱 및 수정된 정보를 졸업요건 충족 처리 이후 저장되는 상태
export const PARSED_PROCESSED_STATE_KEY = 'gijol_parsed_processed_state';

// 대시보드 공통 셸이 전체 성적표를 읽지 않고 업로드 상태만 확인하기 위한 키
export const GRADUATION_METADATA_STATE_KEY = 'gijol_graduation_metadata_state';

// 2025년 이전 클라이언트에서 사용한 키. migration 및 reset에서만 접근한다.
export const LEGACY_GRADUATION_STATE_KEY = 'gijol_grad_state_v1';
export const LEGACY_GRADUATION_LOCAL_KEY = 'gijol_grad_local_v1';
