# Gitalk 댓글 시스템 설정 가이드

## 1. GitHub OAuth App 생성

Gitalk을 사용하려면 GitHub OAuth App을 생성해야 합니다.

### 단계별 가이드:

1. **GitHub에 로그인**하고 **Settings**로 이동
   - GitHub 프로필 우측 상단의 프로필 이미지 클릭 → **Settings**

2. **Developer settings**로 이동
   - Settings 페이지 하단의 **Developer settings** 클릭

3. **OAuth Apps** 선택
   - 좌측 메뉴에서 **OAuth Apps** 클릭

4. **New OAuth App** 클릭

5. **OAuth App 정보 입력:**
   - **Application name**: `junnha.github.io Comments` (또는 원하는 이름)
   - **Homepage URL**: `https://junnha.github.io` (또는 본인의 블로그 URL)
   - **Authorization callback URL**: `https://junnha.github.io` (또는 본인의 블로그 URL)
   - **Description**: 선택사항

6. **Register application** 클릭

7. **Client ID와 Client Secret 복사**
   - 생성된 OAuth App 페이지에서:
     - **Client ID**: 바로 보임 (복사)
     - **Client Secret**: **Generate a new client secret** 클릭 후 생성 (복사)

## 2. _config.yml 설정

`_config.yml` 파일에서 다음 정보를 업데이트하세요:

```yaml
comments:
  provider: gitalk
  
  gitalk:
    clientID    : "복사한 Client ID"
    clientSecret: "복사한 Client Secret"
    repository  : junnha.github.io
    owner       : junnha
    admin:
      - junnha
```

⚠️ **주의**: `clientSecret`은 민감한 정보이므로 GitHub에 커밋하지 마세요!
- 로컬 테스트용으로만 사용하거나
- GitHub Secrets를 사용하여 환경 변수로 관리하는 것을 권장합니다.

## 3. 포스트에 key 추가

각 포스트의 frontmatter에 고유한 `key` 값을 추가해야 합니다:

```yaml
---
title: "포스트 제목"
tags: PS
key: 고유키값
---
```

✅ 이미 모든 포스트에 `key`가 추가되었습니다.

## 4. Jekyll 서버 재시작

설정 변경 후 Jekyll 서버를 재시작하세요:

```bash
# 서버 중지 (Ctrl+C)
# 서버 재시작
bundle exec jekyll serve
```

## 5. 댓글 확인

블로그 포스트 하단에 Gitalk 댓글 섹션이 표시됩니다.
- 첫 번째 댓글을 작성하면 GitHub Issues가 자동으로 생성됩니다.
- 이후 댓글은 해당 Issue에 연결됩니다.

## 문제 해결

### 댓글이 표시되지 않는 경우:
1. `_config.yml`의 `clientID`와 `clientSecret`이 올바르게 설정되었는지 확인
2. 포스트에 `key` 필드가 있는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인
4. GitHub OAuth App의 Authorization callback URL이 올바른지 확인

### 권한 오류:
- GitHub OAuth App이 생성된 저장소(`junnha.github.io`)에 Issues 기능이 활성화되어 있는지 확인
- Repository Settings → Features → Issues 체크

