import { useState } from 'react';
import { useAuth0 } from './auth';
import { GradStatusType } from '../types/grad';

export function useFileUploaded() {
  const { authenticated } = useAuth0();
  const [fileExists, setFileExists] = useState(false);
  // file uploaded 여부 DB에서 가져오는 로직 필요
  // 확인되면 uploaded -> true로 설정
  // 확인되지 않으면 uploaded
  if (authenticated) {
    return { fileExists, setFileExists };
  } else {
    return { fileExists: false, setFileExists };
  }
}
