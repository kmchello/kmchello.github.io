# KIM MINCHAN Portfolio

페그보드 컨셉의 가로 스크롤 포트폴리오입니다. 빌드 도구 없이 HTML, CSS, JavaScript만 씁니다.

## 폴더 구성

```
index.html      화면의 글과 구조
style.css       색, 글자 크기, 위치
main.js         공구 위치, 가로 이동, 마우스에 반응하는 움직임
assets/tools/   공구 이미지 7장 (투명 PNG)
```

## 내 컴퓨터에서 보기

폴더에서 아래 명령을 실행하고 브라우저로 http://localhost:8000 을 엽니다.

```bash
python3 -m http.server 8000
```

글꼴(Inter, Noto Sans KR)은 인터넷에서 불러오므로 연결이 되어 있어야 합니다.

## 움직임

- 마우스 휠, 방향키, 화살표 버튼, 위쪽 메뉴, 아래 진행바로 판을 옮깁니다.
- **HOME, ABOUT**: 흩어진 공구가 커서를 피해 밀려났다가 천천히 제자리로 돌아옵니다.
- **HOME 자리 표시**: 판 뒤에 공구 모양의 빈자리가 깔려 있고, 평소에는 거의 보이지 않다가 커서 주변에서만 또렷해집니다. 농도는 `style.css` 의 `.ghosts img` (`opacity`)와 `mask-image` 끝값(`.07`), 번지는 반경은 `main.js` 의 `stepGhosts` (`270`)에서 고칩니다.
- **WORK, PROCESS**: 판은 가로로 넘기지만, 이 두 판 안에서는 휠(또는 ↑↓ 키)로 내용이 한 장씩 세로로 넘어갑니다. 한 장에는 하나만 보입니다. 첫 장 위나 마지막 장 아래에서 한 번 더 넘기면 이전/다음 판으로 넘어가고, 왼쪽 목록을 누르면 그 장으로 바로 이동합니다.
- **작업 상세**: WORK 에서 작업을 누르면 한 장짜리 긴 페이지가 열리고, 휠로 아래로 내려가며 봅니다. 맨 아래의 NEXT 로 다음 작업으로 넘어가고, Esc 나 ← WORK 로 닫습니다.
- **CONTACT**: 걸려 있는 공구가 커서에 스치면 흔들립니다. (WORK, PROCESS, 작업 상세에는 공구를 두지 않았습니다.)
- 운영체제에서 "동작 줄이기"를 켜 두면 움직임이 꺼집니다.

## 내용 바꾸기

- 글: `index.html` 에서 해당 문장을 찾아 고칩니다.
- WORK 작업 이미지: `index.html` 의 `<div class="shot">…<span>IMAGE</span></div>` 안의 `<span>` 대신 `<img src="assets/work/01.jpg" alt="설명">` 를 넣고,
  `style.css` 에 `.shot img{width:100%;height:100%;object-fit:cover;border-radius:inherit}` 를 추가합니다.
  앱 작업은 세로형 3장(메인 330×717, 서브 280×608), 웹·브랜딩 작업은 가로형 1장(1100×700) 비율입니다. 작업이 앱이 아니면 해당 `<article class="case …">` 의 `app` 을 `wide` 로 바꾸고 `main.js` 의 `WORKS` 의 `kind` 도 같이 바꿉니다.
- 이메일과 링크: `index.html` 의 CONTACT 에서 `작성 예정` 을
  `<a class="v" href="mailto:주소">주소</a>` 처럼 바꿉니다.
- 공구 위치: `main.js` 맨 위의 `DATA` 를 고칩니다.
  한 항목은 `종류, 가운데 x, 가운데 y, 각도, 너비, 높이, (F=반전)` 입니다.

## GitHub Pages 로 올리기

1. GitHub 에서 새 저장소를 만듭니다. 이름을 `아이디.github.io` 로 하면 주소가 `https://아이디.github.io` 가 됩니다.
2. 이 폴더에서 아래 명령을 실행합니다. (`주소` 는 저장소 주소)

   ```bash
   git init
   git add .
   git commit -m "포트폴리오 첫 버전"
   git branch -M main
   git remote add origin 주소
   git push -u origin main
   ```
3. 저장소의 Settings → Pages 에서 Branch 를 `main` / `(root)` 로 선택하고 저장합니다.
4. 1~2분 뒤 주소가 열립니다. 이 주소를 지원서류에 적으면 됩니다.

## 알려진 한계

- 지금은 PC 화면 기준입니다. 폭 820px 이하에서는 안내 문구만 보입니다. 모바일 화면은 따로 만들어야 합니다.

## 작업 상세 내용 채우기

`main.js` 의 `WORKS` 에서 작업마다 아래 항목을 적으면 상세 페이지에 들어갑니다. 비워 두면 "작성 예정"으로 보입니다.

- `desc` 개요, `tools` 사용 도구, `team` 함께한 사람, `stuck` 막혔던 지점, `solved` 푼 방법
- `period` 기간은 `fillDetail` 안의 `$('d-period')` 줄에서 `w.period` 로 바꾸면 됩니다.
- 이미지: `index.html` 의 `<div class="shot"><span>IMAGE</span></div>` 안의 `<span>` 을 `<img src="..." alt="...">` 로 바꿉니다.
