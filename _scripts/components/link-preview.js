/**
 * 링크 미리보기 자동 생성 스크립트
 * 포스트 내의 링크를 감지하여 자동으로 미리보기를 생성합니다.
 */

class LinkPreview {
  constructor() {
    this.init();
  }

  init() {
    // 포스트 내용에서 링크 찾기
    const articleContent = document.querySelector('.article__content');
    if (!articleContent) return;

    // 링크 찾기 (http/https로 시작하는 링크)
    const links = articleContent.querySelectorAll('a[href^="http"]');
    links.forEach(link => {
      this.createPreview(link);
    });
  }

  async createPreview(linkElement) {
    const url = linkElement.href;
    
    // 이미 미리보기가 있는지 확인
    if (linkElement.nextElementSibling?.classList.contains('auto-link-preview')) {
      return;
    }

    try {
      // 링크 정보 가져오기 (Open Graph 메타데이터)
      const linkInfo = await this.fetchLinkInfo(url);
      
      // 미리보기 요소 생성
      const previewElement = this.createPreviewElement(linkInfo, url);
      
      // 링크 다음에 미리보기 삽입
      linkElement.parentNode.insertBefore(previewElement, linkElement.nextSibling);
      
    } catch (error) {
      console.log('링크 미리보기 생성 실패:', url, error);
    }
  }

  async fetchLinkInfo(url) {
    try {
      // Microlink API 사용 (무료)
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          title: data.data.title || '제목 없음',
          description: data.data.description || '설명 없음',
          image: data.data.image?.url || null,
          logo: data.data.logo?.url || null,
          siteName: data.data.publisher || new URL(url).hostname
        };
      }
    } catch (error) {
      console.log('Microlink API 호출 실패:', error);
    }

    // API 실패 시 기본 정보 반환
    return {
      title: new URL(url).hostname,
      description: '링크 미리보기를 불러올 수 없습니다.',
      image: null,
      logo: null,
      siteName: new URL(url).hostname
    };
  }

  createPreviewElement(linkInfo, url) {
    const previewDiv = document.createElement('div');
    previewDiv.className = 'auto-link-preview';
    
    const imageUrl = linkInfo.image || linkInfo.logo;
    
    previewDiv.innerHTML = `
      <div class="auto-link-preview-content">
        <div class="auto-link-preview-text">
          <h4 class="auto-link-preview-title">${this.escapeHtml(linkInfo.title)}</h4>
          <p class="auto-link-preview-description">${this.escapeHtml(linkInfo.description)}</p>
          <div class="auto-link-preview-meta">
            <span class="auto-link-preview-site">${this.escapeHtml(linkInfo.siteName)}</span>
            <span class="auto-link-preview-url">${this.escapeHtml(url)}</span>
          </div>
        </div>
        ${imageUrl ? `
          <div class="auto-link-preview-image">
            <img src="${imageUrl}" alt="링크 미리보기" loading="lazy" 
                 onerror="this.style.display='none'">
          </div>
        ` : ''}
      </div>
    `;

    // 클릭 이벤트 추가
    previewDiv.addEventListener('click', () => {
      window.open(url, '_blank', 'noopener,noreferrer');
    });

    return previewDiv;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 페이지 로드 후 실행
document.addEventListener('DOMContentLoaded', () => {
  new LinkPreview();
});

// 동적 콘텐츠 로드 후에도 실행 (SPA 등)
if (typeof window !== 'undefined') {
  window.LinkPreview = LinkPreview;
} 