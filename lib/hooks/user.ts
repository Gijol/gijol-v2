import { useState } from 'react';
import { useAuth0 } from './auth';

export function useFileUploaded() {
  const { authenticated } = useAuth0();
  const [fileExists, setFileExists] = useState(false);
  // file uploaded 여부 DB에서 가져오는 로직 필요
  // 확인되면 uploaded -> true로 설정
  // 확인되지 않으면 uploaded
  if (authenticated) {
    return { fileExists };
  } else {
    return { fileExists: false };
  }
}
