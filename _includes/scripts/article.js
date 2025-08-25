(function() {
  var SOURCES = window.TEXT_VARIABLES.sources;
  window.Lazyload.js(SOURCES.jquery, function() {
    $(function() {
      var $this ,$scroll;
      var $articleContent = $('.js-article-content');
      var hasSidebar = $('.js-page-root').hasClass('layout--page--sidebar');
      var scroll = hasSidebar ? '.js-page-main' : 'html, body';
      $scroll = $(scroll);

      $articleContent.find('.highlight').each(function() {
        $this = $(this);
        $this.attr('data-lang', $this.find('code').attr('data-lang'));
      });
      $articleContent.find('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]').each(function() {
        $this = $(this);
        $this.append($('<a class="anchor d-print-none" aria-hidden="true"></a>').html('<i class="fas fa-anchor"></i>'));
      });
      $articleContent.on('click', '.anchor', function() {
        $scroll.scrollToAnchor('#' + $(this).parent().attr('id'), 400);
      });
    });
  });
})();

// 링크 미리보기 자동 생성
(function() {
  // 페이지 로드 후 실행
  document.addEventListener('DOMContentLoaded', function() {
    initLinkPreview();
  });

  function initLinkPreview() {
    // 포스트 내용에서 링크 찾기
    const articleContent = document.querySelector('.article__content');
    if (!articleContent) return;

    // 링크 찾기 (http/https로 시작하는 링크)
    const links = articleContent.querySelectorAll('a[href^="http"]');
    links.forEach(function(link) {
      createPreview(link);
    });
  }

  async function createPreview(linkElement) {
    const url = linkElement.href;
    
    // 이미 미리보기가 있는지 확인
    if (linkElement.nextElementSibling && linkElement.nextElementSibling.classList.contains('auto-link-preview')) {
      return;
    }

    try {
      // 링크 정보 가져오기 (Open Graph 메타데이터)
      const linkInfo = await fetchLinkInfo(url);
      
      // 미리보기 요소 생성
      const previewElement = createPreviewElement(linkInfo, url);
      
      // 링크가 포함된 문단의 끝에 미리보기 삽입
      const paragraph = findParentParagraph(linkElement);
      if (paragraph) {
        paragraph.appendChild(previewElement);
      } else {
        // 문단을 찾을 수 없으면 링크 다음에 삽입
        linkElement.parentNode.insertBefore(previewElement, linkElement.nextSibling);
      }
      
    } catch (error) {
      console.log('링크 미리보기 생성 실패:', url, error);
    }
  }

  function findParentParagraph(element) {
    // 링크가 포함된 문단(p, div 등)을 찾기
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      if (parent.tagName === 'P' || 
          parent.tagName === 'DIV' || 
          parent.classList.contains('article__content')) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  async function fetchLinkInfo(url) {
    try {
      // Microlink API 사용 (무료)
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          title: data.data.title || '제목 없음',
          description: data.data.description || '설명 없음',
          image: data.data.image ? data.data.image.url : null,
          logo: data.data.logo ? data.data.logo.url : null,
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

  function createPreviewElement(linkInfo, url) {
    const previewDiv = document.createElement('div');
    previewDiv.className = 'auto-link-preview';
    
    const imageUrl = linkInfo.image || linkInfo.logo;
    
    previewDiv.innerHTML = `
      <div class="auto-link-preview-content">
        <div class="auto-link-preview-text">
          <h4 class="auto-link-preview-title">${escapeHtml(linkInfo.title)}</h4>
          <p class="auto-link-preview-description">${escapeHtml(linkInfo.description)}</p>
          <div class="auto-link-preview-meta">
            <span class="auto-link-preview-site">${escapeHtml(linkInfo.siteName)}</span>
            <span class="auto-link-preview-url">${escapeHtml(url)}</span>
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
    previewDiv.addEventListener('click', function() {
      window.open(url, '_blank', 'noopener,noreferrer');
    });

    return previewDiv;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
})();
