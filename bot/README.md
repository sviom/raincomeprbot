# 팀즈 PR 봇

해당 봇은 봇과 사람간의 상호작용이 아니라 외부에서 특정 상황이 발생할경우 봇으로 전달, 봇에서 사람으로 전달하기 위한 목적으로 개발되었습니다.

## 준비물
- Azure 계정
- 외부에서 접근이 가능한 데이터베이스
- [NodeJS](https://nodejs.org/en/) 개발지식
- 마이크로소프트 365(구 오피스365) 계정. [M365 developer program](https://developer.microsoft.com/en-us/microsoft-365/dev-program)
- [VS Code Teams Tookit익스텐션](https://aka.ms/teams-toolkit)(여기에서 teams-fx cli는 사용하지 않습니다.)
- Bot Framework에 대한 이해
- ngrok에 대한 이해(옵션)
- Adaptive card에 대한 이해(옵션)
- Graph API에 대한 이해(옵션)

## 디버깅
- `F5`를 누르면 자동으로 실행합니다.
- VS Code의 `실행 및 디버깅`메뉴에서 `실행 및 디버그 우측 초록색 삼각형` 버튼으로도 실행할 수 있습니다.


## 간략 순서
1. VS Code에 Teams Toolkit 설치
2. 툴킷 메뉴로 이동 - 우측에 Office 365 / Azure에 로그인을 진행
3. 툴킷을 이용해 앱 생성
4. [Teams Bot Dev Portal](https://dev.teams.microsoft.com/bots) 접속(기존 Teams app stuio앱은 2022년 1월부로 사용되지 않음)해서 봇이 생성되었나 확인
5. Azure AD - App registration에 App이 만들어졌나 확인
    - 필요 시 App에 권한 부여(노티 봇의 경우 사용자 로그인 창을 띄울 수 없으므로 관리자 권한으로 줘야 함)
6. 봇 구성(개발) 및 테스트
7. Azure에 Privisioning
8. Azure에 배포(봇으로 노티를 보내려면 배포해서 endpoint를 알아야함)
    - Bot Service 및 App service, App service plan이 자동으로 생성됨
    - 이름을 예쁘게 하고 싶으면 bot에서 미리 이름을 수정
9. Teams에 배포
    - Toolkit 옵션에 "조직을 위해 설치", "수동으로 배포"가 있음
    - 수동으로 배포 시 사용자가 앱 패키지(zip)을 올려서 배포
    - 관리자가 업데이트할 때도 필요
10. 팀즈 관리자에서 앱 허용
11. 팀즈에서 앱 설치
    - 기존 사용자의 경우 최초에 실행 시 사용자의 액션이 있어야 노티가 가능

## Azure에 배포하기(위의 8번)

- 우측의 툴킷 메뉴을 열고 Accounts 메뉴 및의 Azure에 로그인
- 로그인 후 계정 아래에서 현재 구독중인 요금제 선택
- 툴킷 메뉴 Depolyment에서 `Privision in the Cloud` 선택 또는 커맨드 창에서 `Teams: Privision in the cloud` 선택
- 툴킷 메뉴 Depolyment에서 `Depoly to the cloud` 또는 커맨드 창에서 `Teams: Depoly to the cloud` 선택

> Azure 구독중인 요금제(종량제 등)에 따라 비용이 발생할 수 있습니다.

## Manifest 파일

디렉터리 안에서 `templates/appPackage/manifest.template.json` 파일을 찾을 수 있는데, 중괄호(`{...}`)로 되어있는 부분들은 빌드 시 자동으로 대체 됩니다. 권한이나 여러 다른 내용들을 추가할 수 있는데, 자세한 내용은 문서 [schema reference](https://docs.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema)를 참고하세요.


## Manifest file이 맞는 지 확인

appPackage/manifest.source.json 이 올바른지 확인합니다.

- 툴킷 메뉴의 `Validate manifest file` 또는 커맨드창의 `Teams: Validate manifest file` 클릭합니다.

## 앱 패키지 압축파일 만들기 = 빌드

- 툴킷메뉴의 `Zip Teams metadata package`을 클릭합니다.
- `appPackage` 프로젝트 디렉터리에 압축파일이 생성됩니다.

## 팀즈에 배포

배포(제출)한 후에는 관리자의 승인을 거친 후 Teams 앱 스토어에서 설치할 수 있습니다. 관리자 승인은 팀즈 관리자 포털에서 가능합니다.

- 툴킷메뉴의 `Publish to Teams` 선택
- `Install for organizaion` 자동으로 팀즈 관리자 포털로 제출됨
- `Manually submit Teasm app package file` 앱패키지 압축 파일이 생성되고, 해당 파일을 관리자에게 전달하여 관리자가 관리포털에서 수동으로 업로드하여 배포할 수 있습니다.

## 더 읽어보면 좋을 것들

- [Bot Basics](https://docs.microsoft.com/azure/bot-service/bot-builder-basics?view=azure-bot-service-4.0)
- [Bot Framework Documentation](https://docs.botframework.com/)
- [Azure Bot Service Introduction](https://docs.microsoft.com/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [더 자세히 설명한 블로그](https://sviom.com)
