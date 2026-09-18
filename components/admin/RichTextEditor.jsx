'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  List, ListOrdered, Quote, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Image as ImageIcon, 
  Code, Eye, Upload, Loader2, Undo, Redo,
  Trash2, X
} from 'lucide-react';

export default function RichTextEditor({ value = '', onChange, placeholder = 'Start typing page description...' }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const selectedImgRef = useRef(null);

  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlAltInput, setUrlAltInput] = useState('');
  const [modalType, setModalType] = useState('link'); // 'link' or 'image'
  const [selectedImgData, setSelectedImgData] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingAlt, setPendingAlt] = useState('');
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    h1: false,
    h2: false,
    h3: false,
    h4: false,
    h5: false,
    h6: false,
    p: false,
    ul: false,
    ol: false,
    quote: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    justify: false,
  });

  // Get clean HTML without temporary editor selection classes
  const getCleanHtml = () => {
    if (!editorRef.current) return '';
    const clone = editorRef.current.cloneNode(true);
    const selectedImgs = clone.querySelectorAll('.selected-editor-img');
    selectedImgs.forEach((img) => img.classList.remove('selected-editor-img'));
    return clone.innerHTML;
  };

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      const cleanHtml = getCleanHtml();
      if (cleanHtml !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setRawHtml(value || '');
  }, [value, isHtmlMode]);

  // Set default paragraph separator to <p>
  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch (e) {}
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const cleanHtml = getCleanHtml();
      setRawHtml(cleanHtml);
      if (onChange) onChange(cleanHtml);
    }
  };

  const handleRawHtmlChange = (e) => {
    const html = e.target.value;
    setRawHtml(html);
    if (onChange) onChange(html);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  const updateActiveFormats = () => {
    if (isHtmlMode || !editorRef.current) return;
    try {
      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isUnderline = document.queryCommandState('underline');
      const isStrike = document.queryCommandState('strikeThrough');
      const isUl = document.queryCommandState('insertUnorderedList');
      const isOl = document.queryCommandState('insertOrderedList');
      const isAlignLeft = document.queryCommandState('justifyLeft');
      const isAlignCenter = document.queryCommandState('justifyCenter');
      const isAlignRight = document.queryCommandState('justifyRight');
      const isJustify = document.queryCommandState('justifyFull');

      let currentBlock = '';
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node = selection.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === 1) {
            const tag = node.tagName.toLowerCase();
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote'].includes(tag)) {
              currentBlock = tag;
              break;
            }
          }
          node = node.parentNode;
        }
      }

      setActiveFormats({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        strikeThrough: isStrike,
        h1: currentBlock === 'h1',
        h2: currentBlock === 'h2',
        h3: currentBlock === 'h3',
        h4: currentBlock === 'h4',
        h5: currentBlock === 'h5',
        h6: currentBlock === 'h6',
        p: currentBlock === 'p',
        ul: isUl,
        ol: isOl,
        quote: currentBlock === 'blockquote',
        alignLeft: isAlignLeft,
        alignCenter: isAlignCenter,
        alignRight: isAlignRight,
        justify: isJustify,
      });
    } catch (e) {}
  };

  const execCommand = (command, val = null) => {
    if (isHtmlMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleInput();
    updateActiveFormats();
  };

  // Robust heading formatting with toggle back to paragraph
  const formatBlockTag = (tag) => {
    if (isHtmlMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }

    const lowerTag = tag.toLowerCase();

    // Check if the current selection is already inside this tag
    const selection = window.getSelection();
    let currentTag = '';
    if (selection && selection.rangeCount > 0) {
      let node = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeType === 1 && /^(H[1-6]|P|BLOCKQUOTE)$/i.test(node.tagName)) {
          currentTag = node.tagName.toLowerCase();
          break;
        }
        node = node.parentNode;
      }
    }

    // Toggle: if already in this heading, toggle back to paragraph <p>
    const targetTag = (currentTag === lowerTag && lowerTag !== 'p') ? 'p' : lowerTag;

    let success = false;
    try {
      success = document.execCommand('formatBlock', false, `<${targetTag}>`);
    } catch (e) {}

    if (!success) {
      try {
        success = document.execCommand('formatBlock', false, targetTag);
      } catch (e) {}
    }

    if (!success) {
      try {
        success = document.execCommand('formatBlock', false, targetTag.toUpperCase());
      } catch (e) {}
    }

    handleInput();
    updateActiveFormats();
  };

  const insertList = (type) => {
    if (isHtmlMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const cmd = type === 'ol' ? 'insertOrderedList' : 'insertUnorderedList';
    document.execCommand(cmd, false, null);
    handleInput();
    updateActiveFormats();
  };

  // Deselect currently selected image
  const deselectImage = () => {
    if (selectedImgRef.current) {
      selectedImgRef.current.classList.remove('selected-editor-img');
      selectedImgRef.current = null;
    }
    setSelectedImgData(null);
  };

  // If image was placed in a wrapper div or single-child p, unwrap it to allow natural text wrapping
  const unwrapImageIfInWrapper = (img) => {
    if (!img || !img.parentElement) return;
    const parent = img.parentElement;
    if (parent !== editorRef.current && (parent.tagName === 'DIV' || parent.tagName === 'P')) {
      const clone = parent.cloneNode(true);
      const imgInClone = clone.querySelector('img');
      if (imgInClone) imgInClone.remove();
      if (clone.textContent.trim() === '') {
        parent.replaceWith(img);
      }
    }
  };

  // Editor Click handler - detect click on <img> vs text
  const handleEditorClick = (e) => {
    const target = e.target;
    if (target && target.tagName === 'IMG') {
      if (selectedImgRef.current && selectedImgRef.current !== target) {
        selectedImgRef.current.classList.remove('selected-editor-img');
      }
      selectedImgRef.current = target;
      target.classList.add('selected-editor-img');

      // Determine current alignment
      let currentAlign = 'center';
      if (
        target.classList.contains('align-left') ||
        target.style.float === 'left' ||
        target.getAttribute('data-align') === 'left'
      ) {
        currentAlign = 'left';
      } else if (
        target.classList.contains('align-right') ||
        target.style.float === 'right' ||
        target.getAttribute('data-align') === 'right'
      ) {
        currentAlign = 'right';
      } else if (
        target.classList.contains('align-full') ||
        target.getAttribute('data-align') === 'full'
      ) {
        currentAlign = 'full';
      }

      // Determine current width
      let currentWidth = target.style.width || target.getAttribute('width') || '';
      if (!currentWidth) {
        if (currentAlign === 'full') currentWidth = '100%';
        else if (currentAlign === 'left' || currentAlign === 'right') currentWidth = '45%';
        else currentWidth = 'auto';
      }

      setSelectedImgData({
        src: target.src,
        alt: target.alt || '',
        align: currentAlign,
        width: currentWidth,
      });
    } else {
      deselectImage();
    }
  };

  // Image Alignment & Text Wrap
  const setImageAlignment = (alignType) => {
    const img = selectedImgRef.current;
    if (!img) return;

    unwrapImageIfInWrapper(img);

    img.classList.remove('align-left', 'align-right', 'align-center', 'align-full');
    img.removeAttribute('data-align');

    if (alignType === 'left') {
      img.classList.add('align-left');
      img.setAttribute('data-align', 'left');
      img.style.float = 'left';
      img.style.margin = '0.5rem 1.5rem 1rem 0';
      img.style.display = 'inline-block';
      img.style.clear = 'none';
      if (!img.style.width || img.style.width === '100%') {
        img.style.width = '45%';
        img.style.maxWidth = '45%';
      }
    } else if (alignType === 'right') {
      img.classList.add('align-right');
      img.setAttribute('data-align', 'right');
      img.style.float = 'right';
      img.style.margin = '0.5rem 0 1rem 1.5rem';
      img.style.display = 'inline-block';
      img.style.clear = 'none';
      if (!img.style.width || img.style.width === '100%') {
        img.style.width = '45%';
        img.style.maxWidth = '45%';
      }
    } else if (alignType === 'center') {
      img.classList.add('align-center');
      img.setAttribute('data-align', 'center');
      img.style.float = 'none';
      img.style.margin = '1.5rem auto';
      img.style.display = 'block';
      img.style.clear = 'both';
      img.style.maxWidth = '100%';
    } else if (alignType === 'full') {
      img.classList.add('align-full');
      img.setAttribute('data-align', 'full');
      img.style.float = 'none';
      img.style.margin = '1.5rem 0';
      img.style.display = 'block';
      img.style.clear = 'both';
      img.style.width = '100%';
      img.style.maxWidth = '100%';
    }

    setSelectedImgData((prev) =>
      prev
        ? {
            ...prev,
            align: alignType,
            width: img.style.width || 'auto',
          }
        : null
    );

    handleInput();
  };

  // Image Width Preset
  const setImageWidth = (widthVal) => {
    const img = selectedImgRef.current;
    if (!img) return;

    if (widthVal === 'auto') {
      img.style.width = 'auto';
      img.style.maxWidth = '100%';
    } else {
      img.style.width = widthVal;
      img.style.maxWidth = widthVal;
    }

    setSelectedImgData((prev) => (prev ? { ...prev, width: widthVal } : null));
    handleInput();
  };

  // Image Alt text for SEO
  const setImageAlt = (newAlt) => {
    const img = selectedImgRef.current;
    if (!img) return;
    img.alt = newAlt;
    setSelectedImgData((prev) => (prev ? { ...prev, alt: newAlt } : null));
    handleInput();
  };

  // Delete Image
  const deleteSelectedImage = () => {
    const img = selectedImgRef.current;
    if (!img) return;

    const parent = img.parentElement;
    img.remove();
    if (parent && parent !== editorRef.current && parent.innerHTML.trim() === '') {
      parent.remove();
    }

    selectedImgRef.current = null;
    setSelectedImgData(null);
    handleInput();
  };

  // Outside click listener to deselect image when clicking away
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        deselectImage();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When a file is chosen from disk
  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    saveSelection();
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setPendingFile(file);
    setPendingAlt(cleanName);
    setShowFileUploadModal(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // When user confirms file upload with their chosen Alt Tag
  const handleConfirmFileUpload = async (e) => {
    e.preventDefault();
    if (!pendingFile) return;

    try {
      setUploading(true);
      deselectImage();
      const formData = new FormData();
      formData.append('file', pendingFile);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      restoreSelection();
      const altToUse = pendingAlt.trim() || pendingFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      // Insert uploaded image into editor with default centered display
      execCommand(
        'insertHTML',
        `<img src="${data.url}" alt="${altToUse}" class="align-center rounded-lg shadow border border-slate-200" style="display: block; margin: 1.5rem auto; max-width: 100%; height: auto;" /><p><br/></p>`
      );
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setPendingFile(null);
      setPendingAlt('');
      setShowFileUploadModal(false);
    }
  };

  // Insert Link or Image URL
  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    restoreSelection();
    if (modalType === 'link') {
      execCommand('createLink', urlInput.trim());
    } else if (modalType === 'image') {
      deselectImage();
      const altToUse = urlAltInput.trim() || 'Image';
      execCommand(
        'insertHTML',
        `<img src="${urlInput.trim()}" alt="${altToUse}" class="align-center rounded-lg shadow border border-slate-200" style="display: block; margin: 1.5rem auto; max-width: 100%; height: auto;" /><p><br/></p>`
      );
    }

    setUrlInput('');
    setUrlAltInput('');
    setShowUrlModal(false);
  };

  return (
    <div ref={containerRef} className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm focus-within:border-gold-500 transition">
      {/* Hidden file input for image upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageFileSelect} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Editor Main Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-1 text-slate-700 select-none">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('undo')}
          title="Undo"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('redo')}
          title="Redo"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition"
        >
          <Redo className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Headings: H1, H2, H3, H4, H5, H6, P */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('h1')}
          title="Heading 1"
          className={`px-2 py-1 rounded font-bold text-xs transition ${
            activeFormats.h1
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('h2')}
          title="Heading 2"
          className={`px-2 py-1 rounded font-bold text-xs transition ${
            activeFormats.h2
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('h3')}
          title="Heading 3"
          className={`px-2 py-1 rounded font-bold text-xs transition ${
            activeFormats.h3
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          H3
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('h4')}
          title="Heading 4"
          className={`px-2 py-1 rounded font-bold text-xs transition ${
            activeFormats.h4
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          H4
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('h5')}
          title="Heading 5"
          className={`px-2 py-1 rounded font-bold text-xs transition ${
            activeFormats.h5
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          H5
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('h6')}
          title="Heading 6"
          className={`px-2 py-1 rounded font-bold text-xs transition ${
            activeFormats.h6
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          H6
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('p')}
          title="Paragraph (Normal Text)"
          className={`px-2 py-1 rounded font-medium text-xs transition ${
            activeFormats.p
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          P
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Basic Styles */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('bold')}
          title="Bold"
          className={`p-1.5 rounded transition ${
            activeFormats.bold
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('italic')}
          title="Italic"
          className={`p-1.5 rounded transition ${
            activeFormats.italic
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('underline')}
          title="Underline"
          className={`p-1.5 rounded transition ${
            activeFormats.underline
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('strikeThrough')}
          title="Strikethrough"
          className={`p-1.5 rounded transition ${
            activeFormats.strikeThrough
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => insertList('ul')}
          title="Bullet List"
          className={`p-1.5 rounded transition ${
            activeFormats.ul
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => insertList('ol')}
          title="Numbered List"
          className={`p-1.5 rounded transition ${
            activeFormats.ol
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => formatBlockTag('blockquote')}
          title="Blockquote"
          className={`p-1.5 rounded transition ${
            activeFormats.quote
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <Quote className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
          className={`p-1.5 rounded transition ${
            activeFormats.alignLeft
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
          className={`p-1.5 rounded transition ${
            activeFormats.alignCenter
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
          className={`p-1.5 rounded transition ${
            activeFormats.alignRight
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('justifyFull')}
          title="Justify Text (Align Both Left & Right)"
          className={`p-1.5 rounded transition ${
            activeFormats.justify
              ? 'bg-gold-500 text-white shadow-xs'
              : 'hover:bg-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-300 mx-1" />

        {/* Link & Image Upload */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
          }}
          onClick={() => {
            setModalType('link');
            setShowUrlModal(true);
          }}
          title="Insert Link"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Upload Image button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload Image from Computer"
          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gold-50 text-gold-700 hover:bg-gold-100 rounded border border-gold-300 text-xs font-medium transition"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
          }}
          onClick={() => {
            setModalType('image');
            setShowUrlModal(true);
          }}
          title="Insert Image URL"
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 hover:text-slate-900 transition"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center space-x-1">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              deselectImage();
              setIsHtmlMode(!isHtmlMode);
            }}
            title={isHtmlMode ? 'Switch to Visual Editor' : 'Switch to HTML Code Mode'}
            className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition ${
              isHtmlMode 
                ? 'bg-slate-800 text-white' 
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isHtmlMode ? <Eye className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
            <span>{isHtmlMode ? 'Visual' : 'HTML'}</span>
          </button>
        </div>
      </div>

      {/* Selected Image Options Toolbar */}
      {selectedImgData && !isHtmlMode && (
        <div className="bg-amber-50/95 border-b border-amber-200 px-3 py-2 flex flex-wrap items-center gap-2 text-xs text-amber-950 animate-fadeIn transition">
          <div className="flex items-center space-x-1 font-semibold text-amber-900 mr-1">
            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>Image Options:</span>
          </div>

          {/* Alignment / Wrap buttons */}
          <div className="flex items-center space-x-0.5 bg-white p-0.5 rounded-lg border border-amber-200 shadow-2xs">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setImageAlignment('left')}
              title="Wrap Left (Float Left, text wraps around image)"
              className={`px-2 py-1 rounded font-medium transition flex items-center space-x-1 ${
                selectedImgData.align === 'left'
                  ? 'bg-gold-500 text-white font-bold shadow-xs'
                  : 'hover:bg-amber-100 text-slate-700'
              }`}
            >
              <span>⬅️ Wrap Left</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setImageAlignment('center')}
              title="Center (Centered block, text above & below)"
              className={`px-2 py-1 rounded font-medium transition flex items-center space-x-1 ${
                selectedImgData.align === 'center'
                  ? 'bg-gold-500 text-white font-bold shadow-xs'
                  : 'hover:bg-amber-100 text-slate-700'
              }`}
            >
              <span>⏺️ Center</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setImageAlignment('right')}
              title="Wrap Right (Float Right, text wraps around image)"
              className={`px-2 py-1 rounded font-medium transition flex items-center space-x-1 ${
                selectedImgData.align === 'right'
                  ? 'bg-gold-500 text-white font-bold shadow-xs'
                  : 'hover:bg-amber-100 text-slate-700'
              }`}
            >
              <span>➡️ Wrap Right</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setImageAlignment('full')}
              title="Full Width (100% width)"
              className={`px-2 py-1 rounded font-medium transition flex items-center space-x-1 ${
                selectedImgData.align === 'full'
                  ? 'bg-gold-500 text-white font-bold shadow-xs'
                  : 'hover:bg-amber-100 text-slate-700'
              }`}
            >
              <span>↔️ Full Width</span>
            </button>
          </div>

          <span className="w-px h-5 bg-amber-200 mx-0.5" />

          {/* Width Presets */}
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-amber-800 font-medium">Width:</span>
            {['25%', '33%', '50%', '75%', '100%', 'auto'].map((sz) => (
              <button
                key={sz}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setImageWidth(sz)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition border ${
                  selectedImgData.width === sz
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-semibold'
                    : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {sz === 'auto' ? 'Auto' : sz}
              </button>
            ))}
          </div>

          <span className="w-px h-5 bg-amber-200 mx-0.5" />

          {/* Alt text for SEO */}
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-amber-800 font-medium">Alt:</span>
            <input
              type="text"
              value={selectedImgData.alt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="SEO alt text..."
              className="w-32 sm:w-44 px-2 py-0.5 bg-white border border-amber-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Delete Image */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={deleteSelectedImage}
            title="Delete Image"
            className="ml-auto inline-flex items-center space-x-1 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded font-medium transition text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>

          {/* Close toolbar */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={deselectImage}
            title="Deselect Image"
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-amber-200/50 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Content Box */}
      {isHtmlMode ? (
        <textarea
          value={rawHtml}
          onChange={handleRawHtmlChange}
          rows={16}
          className="w-full p-4 font-mono text-xs bg-slate-900 text-slate-100 focus:outline-none resize-y"
          placeholder="Type or paste raw HTML code here..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onClick={handleEditorClick}
          onInput={handleInput}
          onBlur={handleInput}
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onSelect={updateActiveFormats}
          className="rich-text-content prose max-w-none p-5 min-h-[340px] focus:outline-none text-slate-800 text-sm leading-relaxed"
          data-placeholder={placeholder}
        />
      )}

      {/* Insert URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-base mb-2">
              {modalType === 'link' ? 'Insert Hyperlink' : 'Insert Image from URL'}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              {modalType === 'link' 
                ? 'Enter the destination URL (e.g. https://dailyhukamnama.in/...)' 
                : 'Enter the public image URL and SEO alt tag'}
            </p>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {modalType === 'link' ? 'Hyperlink URL' : 'Image URL'}
                </label>
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
                />
              </div>

              {modalType === 'image' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Image Alt Tag (for SEO / Google Search)
                  </label>
                  <input
                    type="text"
                    value={urlAltInput}
                    onChange={(e) => setUrlAltInput(e.target.value)}
                    placeholder="e.g. Gurdwara Sri Tarn Taran Sahib Amritsar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-semibold shadow"
                >
                  Insert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Upload Modal with Alt Tag */}
      {showFileUploadModal && pendingFile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-fadeIn">
            <h4 className="font-bold text-slate-900 text-base mb-1">
              Insert Uploaded Image
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              File: <strong className="text-slate-700">{pendingFile.name}</strong> ({((pendingFile.size || 0) / 1024).toFixed(1)} KB)
            </p>
            <form onSubmit={handleConfirmFileUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image Alt Tag (Image SEO) <span className="text-gold-600 font-normal">• Recommended</span>
                </label>
                <input
                  type="text"
                  required
                  value={pendingAlt}
                  onChange={(e) => setPendingAlt(e.target.value)}
                  placeholder="Describe this image for Google Image Search & SEO..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Accurate alt tags boost website SEO and appear in Google image results.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowFileUploadModal(false);
                    setPendingFile(null);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 text-xs bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-semibold shadow disabled:opacity-50 inline-flex items-center space-x-1.5"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{uploading ? 'Uploading...' : 'Insert Image'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
