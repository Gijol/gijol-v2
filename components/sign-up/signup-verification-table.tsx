import { UserStatusType } from "@lib/types/index";
import { Code, Container, createStyles, Table } from "@mantine/core";

export function SignupVerificationTable({ parsedUserStatus }: { parsedUserStatus: UserStatusType | null }) {
  const { classes, cx } = useStyles();
  const rows = parsedUserStatus?.userTakenCourseList.map((element) => (
    <tr key={element.courseCode}>
      <td>{element.year}</td>
      <td>{element.semester}</td>
      <td><Code>{element.courseCode}</Code></td>
      <td>{element.courseName}</td>
      <td>{element.courseType}</td>
      <td>{element.credit}</td>
      <td>{element.grade}</td>
      
      
    </tr>
  ));
  return (
    <div className={classes.tableBorder}>
    <Table verticalSpacing="xs" fontSize="sm">
      <thead>
        <tr>
          <th>연도</th>
          <th style={{ width: '70px' }}>학기</th>
          <th>과목코드</th>
          <th>과목명</th>
          <th style={{ width: '70px' }}>과목구분</th>
          <th style={{ width: '70px' }}>학점</th>
          <th style={{ width: '70px' }}>성적</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
    </div>
  )
}

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    transition: 'box-shadow 150ms ease',
  },
  scrolled: {
    boxShadow: theme.shadows.sm,
  },
  tableBorder: {
    border: '1px solid #dee2e6',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    position: 'relative',
  },
}));
