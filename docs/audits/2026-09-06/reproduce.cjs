// Diagnostic audit for commit 214f53a; run from the repository root.
// Synthetic inputs only. Records current behavior; does not assert that behavior is correct.
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const local = p => require(path.join(root, p));
const { evaluateGraduationStatus } = local('features/graduation/domain/engine');
const { normalizeTakenCourses } = local('features/graduation/middlewares/validation');
const { buildGraduationRecommendationGroups } = local('features/graduation/data/source-backed-recommendations');
const { createCourseCatalogRecommendationIndex } = local('features/course-catalog/recommendations');
const snapshot = local('features/course-catalog/generated/course-catalog.snapshot.json');
const index = createCourseCatalogRecommendationIndex(snapshot);
const course = (code, name = code, credit = 3, extra = {}) => ({courseCode:code,courseName:name,credit,grade:'A0',courseType:'교양',year:2026,semester:'1',...extra});
const cases = [
 ['calculus', [course('GS1001','미적분학과 응용')]],
 ['chemistry_lecture_only', [course('GS1201','일반화학 및 연습 I')]],
 ['chemistry_with_lab', [course('GS1201','일반화학 및 연습 I'),course('GS1211','일반화학실험 I',1)]],
 ['chemistry_II_with_lab_II', [course('GS1202','일반화학 및 연습 II'),course('GS1212','일반화학실험 II',1)]],
 ['sw_completed', [course('GS1490','SW기초와 코딩',2)]],
 ['programming_completed', [course('GS1401','컴퓨터 프로그래밍')]],
 ['sw_and_three_sciences', [course('GS1001'),course('GS2001'),course('GS1490','SW기초와 코딩',2),course('GS1101'),course('GS1111','실험',1),course('GS1201'),course('GS1211','실험',1),course('GS1301'),course('GS1311','실험',1)]],
 ['writing_completed', [course('GS1513','글쓰기의 기초: 창의적 글쓰기')]],
 ['writing_two_2026', [course('GS1513','글쓰기의 기초: 창의적 글쓰기'),course('GS1531','심화 글쓰기: 과학 글쓰기')]],
 ['humanities_hs', [course('HS2507','(MOOC 지정) 시의 이해'),course('HS2789','안보와 무기체계')]],
 ['humanities_english_title', [course('HS2523','영어단편소설 읽기')]],
 ['humanities_physics_title', [course('HS3754','사회물리학: 네트워크적 접근')]],
 ['security_legacy_code', [course('GS2789','안보와 무기체계')]],
 ['exploration_UC0902', [course('UC0902','GIST 전공탐색',1)]],
 ['exploration_GS1900', [course('GS1900','GIST 전공탐색',1)]],
 ['semiconductor_exemption', [], {userMajor:'SE'}],
 ['probability_2026', [course('GS2008','확률과 통계')]],
 ['old_core_math', [course('GS1002','다변수해석학과 응용')]],
 ['mooc_python', [course('GS1499','(MOOC 지정)파이썬 기초',2)]],
 ['transfer_missing_code', [course('','타대학 인정과목',3,{grade:'S',courseType:'전공'})]],
 ['transfer_external_code', [course('EXT101','타대학 인정과목',3,{grade:'S',courseType:'전공'})]],
 ['transfer_mapped_code', [course('EC2201','회로이론',3,{grade:'S',courseType:'전공'})]],
 ['thesis', [course('EC9102','학사논문연구 I',3,{grade:'S'}),course('EC9103','학사논문연구 II',3,{grade:'S'})]],
 ['materials_empty', [], {userMajor:'MA'}],
 ['major_45', Array.from({length:15},(_,i)=>course('EC'+(6000+i),'전공 과목'))],
 ['humanities_39', Array.from({length:13},(_,i)=>course('HS'+(6000+i),'인문사회 과목'))],
 ['sports_same_course_two_terms', [course('GS0101','축구',0,{grade:'S',semester:'1'}),course('GS0101','축구',0,{grade:'S',semester:'2'})]],
 ['sports_two_courses_same_term', [course('GS0101','축구',0,{grade:'S'}),course('GS0102','테니스',0,{grade:'S'})]],
];
(async()=>{
 const outputs=[];
 for (const [name,courses,options={}] of cases) {
  const takenCourses=normalizeTakenCourses({takenCourses:courses});
  const ctx={entryYear:2026,userMajor:'EC',...options};
  const result=await evaluateGraduationStatus({takenCourses,ruleContext:ctx});
  const rec=buildGraduationRecommendationGroups({result,...ctx,takenCourses:takenCourses.takenCourses,courseCatalogIndex:index});
  outputs.push({name,inputCodes:courses.map(c=>c.courseCode),normalizedCodes:takenCourses.takenCourses.map(c=>c.courseCode),totalCredits:result.totalCredits,categories:Object.fromEntries(Object.entries(result.graduationCategory).map(([k,v])=>[k,{credits:v.totalCredits,codes:v.userTakenCoursesList.takenCourses.map(c=>c.courseCode)}])),requirements:result.fineGrainedRequirements.filter(r=>['science-total','science-calculus','science-core-math','science-sw-basic','language-writing','language-total','etc-major-exploration','major-credits','thesis-i','thesis-ii','humanities-total','humanities-hus','humanities-ppe','arts','sports'].includes(r.id)).map(r=>({id:r.id,satisfied:r.satisfied,required:r.requiredCredits,acquired:r.acquiredCredits})),recommendations:rec.allRecommendations.map(c=>({code:c.courseCode,requirement:c.requirementId}))});
 }
 fs.writeFileSync(path.resolve(process.argv[2] || path.join(__dirname, 'reproductions.after.json')),JSON.stringify(outputs,null,2));
 console.log(JSON.stringify(outputs.map(o=>({name:o.name,total:o.totalCredits,science:o.categories.scienceBasic,free:o.categories.otherUncheckedClass,major:o.requirements.find(r=>r.id==='major-credits'),writingRecommendations:o.recommendations.filter(r=>/^GS15/.test(r.code)),swRecommendations:o.recommendations.filter(r=>r.code==='GS1490'||r.code==='GS1401'),coreMath:o.requirements.find(r=>r.id==='science-core-math'),exploration:o.requirements.find(r=>r.id==='etc-major-exploration')})),null,2));
})();
