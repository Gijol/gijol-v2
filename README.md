#  Gijol v2

지졸의 두 번째 버전입니다!

## API routes (local development)

- POST /api/graduation/upload
  - multipart/form-data, field `file` (xls/xlsx)
  - returns parsed graduation status JSON
  - curl example:

  ```bash
  curl -v -F "file=@public/files/grade_report.xls" http://localhost:3000/api/graduation/upload
  ```

- GET /api/courses/search?q=keyword&limit=10
  - returns a small static set of course data from `lib/const/course.ts`
  - curl example:

  ```bash
  curl "http://localhost:3000/api/courses/search?q=math&limit=10"
  ```
