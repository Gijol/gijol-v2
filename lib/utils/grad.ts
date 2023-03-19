import { GradStatusType } from '../types/grad';
import { GradeReportParser } from './parser/grade/gradeReportParser';

class HTTPError extends Error {
  constructor(messages?: string) {
    super(messages);
    this.name = 'HTTP Error';
  }
}

async function readFileAndParse(file: File) {
  return new Promise(resolve => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const { result } = fileReader;
      if (result) {
        resolve(GradeReportParser.readXlsxFile(result as string));
      }
    };
    fileReader.readAsBinaryString(file);
  });
}

export default async function postGradStatusFile(
  gradeStatusFile: File,
  majorType: string
): Promise<GradStatusType> {
  const BASE_URL = 'https://dev-api.gijol.im';
  const payload = new FormData();

  const gradeStatus = await readFileAndParse(gradeStatusFile);
  console.log(gradeStatus);

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
