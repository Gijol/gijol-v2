import { GradStatusType } from '../types/grad';

class HTTPError extends Error {
  constructor(messages?: string) {
    super(messages);
    this.name = 'HTTP Error';
  }
}

export default async function postGradStatusFile(
  gradeStatusFile: File,
  majorType: string
): Promise<GradStatusType> {
  const BASE_URL = 'https://dev-api.gijol.im';
  const payload = new FormData();

  payload.append('majorType', majorType);
  payload.append('multipartFile', gradeStatusFile);

  const gradResultResponse = await fetch(`${BASE_URL}/graduation`, {
    method: 'POST',
    body: payload,
  })
    .then((res) => res.json())
    .then((data) => data);
  if (gradResultResponse.status === 405) {
    throw new HTTPError('지원하지 않는 학번입니다.');
  }
  if (gradResultResponse.status === 500) {
    throw new HTTPError('파일 입력 오류.');
  }
  return gradResultResponse;
}
