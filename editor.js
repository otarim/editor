// 颜色选择器
// 源码模式
var editor = {
	init: function(config) {
		var button = {
			'removeFormat': '还原',
			'bold': '加粗',
			'italic': '斜体',
			'underline': '下划线',
			'strikethrough': '删除线',
			'justifyleft': '居左',
			'justifycenter': '居中',
			'justifyright': '居右',
			'indent': '缩进',
			'outdent': '悬挂',
			'forecolor': '前景色',
			'backcolor': '背景色',
			'createlink': '超链接',
			'insertimage': '插图',
			'fontname': '字体',
			'fontsize': '字码',
			'insertorderedlist': '有序列表',
			'insertunorderedlist': '无序列表',
			'table': '插入表格',
			'file': '插入附件',
			'emoticons': '插入表情',
			'html': '源码模式'
		},
		fontname = ['宋体', '经典中圆简', '微软雅黑', '黑体', '楷体', '隶书', '幼圆', 'Arial', 'Arial Narrow', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia', 'New Roman Times', 'Verdana'],
		fontsize = {
			'xx-small': 1,
			'x-small': 2,
			'small': 3,
			'medium': 4,
			'large': 5,
			'x-large': 6,
			'xx-large': 7
		}
		this.el = config.el;
		this.postURL = config.postURL;
		//初始化editor,包括控件生成等等
		this.renderLayout();
		this.buildBtn(button, fontname, fontsize);
		this.bind();
		this.win.focus();
	},
	addEvent: (function() {
		if (typeof addEventListener === 'function') {
			return function(el, type, callback) {
				return el.addEventListener(type, callback, false)
			}
		} else {
			return function(el, type, callback) {
				return el.attachEvent('on' + type, callback)
			}
		}
	})(),
	getData: function(el, property) {
		// in lte ie10 ,('dataset' in el) return false
		// if data-property is not defined, getAtrribute return null insteadof  undefined
		return 'dataset' in el ? el.dataset[property] : el.getAttribute('data-' + property);
	},
	setData: function(el, property, value) {
		return 'dataset' in el ? (el.dataset[property] = value) : (el.setAttribute('data-' + property,value))
	},
	renderLayout: function() {
		// build frame
		var frame = this.frame = document.createElement('iframe'),self = this;
		frame.frameBorder = 0;
		frame.width = '100%';
		frame.height = '100%';
		frame.style.cssText = ';border: 1px solid #ccc';
		frame.id = 'editor-area';
		this.el.appendChild(frame);
		//fix ie8 cursor issue when iframe is onblur
		// here just apply in the toggleView mode
		if(!-[1,]){
			var bookmark;
			//记录IE的编辑光标
			this.addEvent(this.frame,"beforedeactivate",function(){//在文档失去焦点之前
			  var range = self.doc.selection.createRange();
			  bookmark= range.getBookmark();
			});
			//恢复IE的编辑光标
			this.addEvent(this.frame,"activate",function(){
			  if(bookmark){
			    var range = self.doc.body.createTextRange();
			    range.moveToBookmark(bookmark);
			    range.select();
			    bookmark = null;
			  }
			});
		}
		this.win = frame.contentWindow;
		this.doc = this.win.document;
		// solve ff's contentEditable issue
		this.doc.open();
		this.doc.write("<!doctype html><html lang='en'><head><meta charset='UTF-8'><title>Document</title></head><body style='margin: 0;word-break: break-all'></body></html>")
		this.doc.close();
		this.doc.designMode = 'On';
		// build textarea
		var textarea = this.textarea = document.createElement('textarea');
		textarea.style.cssText = ';display: none;color: #00ff00;font-size: 12pt;font-family: courier;background: transparent;resize: none;border: none;text-align: left;width: 100%;height: 100%;border: 1px solid #ccc;background: #000;';
		textarea.id = 'textarea';
		this.el.appendChild(textarea);
	},
	buildBtn: function(button, fontname, fontsize) {
		var tool = this.tool = document.createElement('div');
		tool.id = 'editor-tool';
		this.el.insertBefore(tool, this.el.firstChild);
		// 构建普通功能按钮
		var btnCss = '#editor-tool .edBtn {font-size: 12px;color: #555;border:1px solid #ccc;background: #f7f7f7;box-shadow: inset 0 1px 0 #fff,0 1px 0 rgba(0,0,0,.08);display: inline-block;vertical-align:top;height:20px;line-height:20px;padding:0 3px;cursor: pointer;margin:0 3px 3px 0;border-radius: 3px;}#editor-tool .edBtn-fake {position: relative}#editor-tool .edBtn-fake div,#editor-tool .edBtn-fake table{display:none;}#editor-tool .edBtn-fake-on div,#editor-tool .edBtn-fake-on table {display:block;position: absolute;top:20px;left:0;border:1px solid #ccc;background: #f7f7f7;box-shadow: inset 0 1px 0 #fff,0 1px 0 rgba(0,0,0,.08);height: 80px;overflow:auto;overflow-x: hidden;}#editor-tool .edBtn-fake-on div span {display: block;line-height: 20px;padding: 0 15px 0 3px;white-space:nowrap;}#editor-tool .edBtn-fake-on table{display: table;width: 112px;}#editor-tool .edBtn-file{position: relative;overflow:hidden;}.edBtn-file input{opacity:0;position: absolute;top:0;right:0;/*点击区域*/filter:alpha(opacity=0);cursor:pointer;}';
		// 插入style ie 插入 style 无可视化元素问题（innerHTML 问题）
		var sheet = document.createElement('style');
		sheet.setAttribute('type', 'text/css');
		if (sheet.styleSheet) {
			sheet.styleSheet.cssText = btnCss;
		} else {
			sheet.innerHTML = btnCss;
		}
		 document.getElementsByTagName('head')[0].appendChild(sheet);
		//构建layout
		var tpl = [];
		for (var i in button) {
			if (button.hasOwnProperty(i)) {
				// 按钮特殊化处理
				if (i === 'html') {
					tpl.push('<span data-value="' + i + '" data-method="' + i + '" data-mode="0" unselectable="on" class="edBtn">' + button[i] + '</span>');
				} else if (i === 'fontname') {
					// 构建fontname,伪下拉
					tpl.push('<span data-type="fontName" class="edBtn edBtn-fake" unselectable="on">字体<div>')
					for (var j = 0; j < fontname.length; j++) {
						if (fontname.hasOwnProperty(j)) {
							tpl.push('<span data-value="' + fontname[j] + '" data-method="' + i + '" unselectable="on">' + fontname[j] + '</span>');
						}
					}
					tpl.push('</div></span>');
				} else if (i === 'fontsize') {
					// 构建字号,伪下拉
					tpl.push('<span data-type="fontSize" class="edBtn edBtn-fake" unselectable="on">字号<div>')
					for (var k in fontsize) {
						if (fontsize.hasOwnProperty(k)) {
							tpl.push('<span data-value="' + fontsize[k] + '" data-method="' + i + '" unselectable="on">' + k + '</span>');
						}
					}
					tpl.push('</div></span>');
				} else if (i === 'table') {
					tpl.push('<span data-type="table" class="edBtn edBtn-fake" unselectable="on">' + button[i]);
					var table_tpl = '<table>' +
						'<tr><td>行</td><td><input type="text" value="3" id="JS_edTable_cols"></td></tr>' +
						'<tr><td>列</td><td><input type="text" value="5" id="JS_edTable_rows"></td></tr>' +
						'<tr><td>宽</td><td><input type="text" value="500" id="JS_edTable_width"></td></tr>' +
						'<tr><td></td><td><input type="button" data-method="insertHtml" data-value="table" value="确定"></td></tr>' +
						'</table></span>';
					tpl.push(table_tpl)
				} else if (i === 'emoticons') {
					tpl.push('<span data-type="emoticons" class="edBtn edBtn-fake" unselectable="on">' + button[i] + '<table><tr>');
					for (var k = 11; k < 31; k++) {
						tpl.push('<td><img src="./emotions/' + k + '.gif" width="20" height="20" data-method="insertHtml" data-value="img"/></td>')
						if (k % 5 == 0) {
							tpl.push('</tr></tr>')
						}
					}
					tpl.push('</table></span>');
				}else if(i === 'file'){
					tpl.push('<span data-value="' + i + '" data-method="' + i + '" unselectable="on" class="edBtn edBtn-file">' + button[i] + '<input type="file" id="JS_edTable_file" name="edTable-file"></span>');
				}else {
					tpl.push('<span data-value="' + i + '" data-method="' + i + '" unselectable="on" class="edBtn">' + button[i] + '</span>');
				}

			}
		}
		tool.innerHTML += tpl.join('');
	},
	bind: function(tool) {
		var self = this,
			tool = this.tool,
			method, mode;
		function toggleView(target) {
			if ((mode = self.getData(target, 'mode')) == 0) {
				setTimeout(function(){
					// 光标修正
					self.resetCursorPos();
				},0)
				self.win.blur();
				self.setData(target, 'mode', 1);
				self.frame.style.display = 'none';
				self.textarea.style.display = 'block';
				self.textarea.value = self.doc.body.innerHTML;
				target.innerHTML = '预览模式';
			} else {
				setTimeout(function(){
					self.win.focus();
				},0)
				self.setData(target, 'mode', 0);
				self.textarea.style.display = 'none';
				self.frame.style.display = 'block';
				self.doc.body.innerHTML = self.textarea.value;
				target.innerHTML = '源码模式';
				// self.doc.designMode = 'on';
			}
		}

		function inserhtml(html) {
			self.win.focus();
			if (document.selection) {
				self.doc.selection.createRange().pasteHTML(html);
			} else {
				var selection = self.win.getSelection(); //取得selection(我们刚才选中的文本)
				var range;
				if (selection) { //如果selection不为空，就在selection中创建range对象
					range = selection.getRangeAt(0);
				} else {
					range = self.doc.createRange(); //否则在iframe的document创建一个
				}
				var oFragment = range.createContextualFragment(html), //把插入内容转变为DocumentFragment
					oLastNode = oFragment.lastChild; //用于修正编辑光标的位置
				range.insertNode(oFragment);
				range.setEndAfter(oLastNode); //把编辑光标放到我们插入内容之后
				range.setStartAfter(oLastNode);
				selection.removeAllRanges(); //清除所有选择，要不我们插入的内容与刚才的文本处于选中状态
				selection.addRange(range); //插入内容
			}
		}
		this.addEvent(tool, 'click', function(e) {
			var target = e.srcElement || e.target,
				method = self.getData(target, 'method'),
				col, row, width, table_tpl = [];
			if (method) {
				// fixed getAttribute's issue
				switch (method) {
					case 'createlink':
					case 'insertimage':
						value = prompt('请插入链接', 'http://');
						self.setStyle(method,value);
						break;
					case 'html':
						toggleView(target);
						break;
					case 'insertHtml':
						if (self.getData(target, 'value') === 'img') {
							inserhtml('<img src="' + target.src + '" />');
						} else if (self.getData(target, 'value') === 'table') {
							col = document.getElementById('JS_edTable_cols').value;
							row = document.getElementById('JS_edTable_rows').value;
							width = document.getElementById('JS_edTable_width').value;
							table_tpl.push('<table width="' + width + '" border="1" style="border-collapse:collapse;">');
							for (var i = 0; i < col; i++) {
								table_tpl.push('<tr>');
								for (var j = 0; j < row; j++) {
									table_tpl.push('<td>&nbsp;</td>');
								}
								table_tpl.push('</tr><tr>');
							}
							table_tpl.push('</table>');
							inserhtml(table_tpl.join(''));
						}
						e.stopPropagation ? e.stopPropagation : (window.event.cancelBubble = true);
						break;
					case 'file':
						break;
					case 'fontsize':
					case 'fontname':
						e.stopPropagation ? e.stopPropagation : (window.event.cancelBubble = true);
						self.setStyle(method,self.getData(target, 'value'));
						break;
					default:
						self.setStyle(method,self.getData(target, 'value'));
						break;
				}
				self.activeEdBtn && (self.activeEdBtn.className = self.activeEdBtn.className.replace(/\s*edBtn-fake-on\s*/g, ''))
				self.activeEdBtn = null;
			} else if (target.className.match(/edBtn-fake/)) {
				if (target.className.match(/edBtn-fake-on/)) {
					target.className = target.className.replace(/\s*edBtn-fake-on\s*/g, '');
					self.activeEdBtn = null;
				} else {
					target.className += ' edBtn-fake-on';
					// 当前激活元素
					self.activeEdBtn && (self.activeEdBtn.className = self.activeEdBtn.className.replace(/\s*edBtn-fake-on\s*/g, ''))
					self.activeEdBtn = target;
				}
				// self.win.focus();
				// unselectable fixed focus issue
			}
		})
		this.bindSingleEvent();
	},
	bindSingleEvent: function(){
		var file = document.getElementById('JS_edTable_file'),
			self = this;
		this.addEvent(file,'change',function(e){
			// post上传文件,不支持的用iframe
			var target = e.srcElement || e.target,
				status = false,
				file,xhr,formdata,form,frame,data;
			if(typeof FormData === 'function'){
				// 支持FormData,用2代ajax上传
				xhr = new XMLHttpRequest();
				formdata = new FormData();
				formdata.append(target.name,target.files[0]);
				xhr.open('post',self.postURL,true);//false 为同步
				xhr.withCredentials = true; //默认跨域不带 cookie....
				xhr.setRequestHeader("Content-Disposition","form-data");
				xhr.onload = function(e){
					alert('xxx');
				}
				xhr.send(formdata);
			}else{
				// 使用windowname,为了获取跨域的response
				random = Math.random().toString(32).slice(2);
				// 解决iframe下弹出新窗口的问题
				try {
					frame = document.createElement('<iframe name="'+random+'" style="display:none">'); 
				} catch (ex) {
					frame = document.createElement('iframe');
					frame.name = random;
					frame.style.display = 'none';
				}
				form = document.createElement('form');
				form.method = 'post';
				form.target = frame.name;
				form.action = self.postURL;
				// ie下未隐藏的form中的元素会显示
				form.style.display = 'none';
				input = document.createElement('input');
				input.type = 'file';
				input.name = target.name;
				input.files = target.files;
				form.appendChild(input);
				document.body.appendChild(frame);
				document.body.appendChild(form);
				// 第一次onload为about:blank,append完在定义onload
				self.addEvent(frame,'load',function(){
					if(!status){
						frame.contentWindow.location = 'about:blank';
						status = true;
					}else{
						data = frame.contentWindow.name;
						frame.contentWindow.document.write('');
						frame.contentWindow.close();
						document.body.removeChild(frame);
						document.body.removeChild(form);
					}
				})
				form.submit();
			}
			getFileClientPath(target);
		})
		function getFileClientPath(obj){
			var img = document.createElement('img'),reader;
			if(typeof FileReader === 'function'){
				// 支持 fileReader 用 fileReader 生成缩略图
				reader = new FileReader;
				reader.onload = function(){
					document.body.appendChild(img);
					img.src = this.result;
				}
				reader.readAsDataURL(obj.files[0]);
			}else if(document.selection){
				// 不支持的使用 ie 自己的生成
				obj.select();
				alert(document.selection.createRange().text)
				document.body.appendChild(img);
				img.src = document.selection.createRange().text;
			}
		}
	},
	resetCursorPos: function(){
	    var textarea = this.textarea,
	    	length = this.textarea.value.length,
	    	range;
	    if(window.netscape){
	        // ff
	        textarea.setSelectionRange(length,length);
	    }else if(typeof textarea.selectionStart == 'number'){
	        // webkit
	        textarea.selectionStart = textarea.selectionEnd = length;
	    }else if(textarea.createTextRange){
	        // ie
	        range = textarea.createTextRange();
	        range.collapse(true);
	        range.moveStart('character', 0);
	        range.moveEnd('character', length);
	        range.select();
	    }
	    textarea.focus();
	},
	setStyle: function(command, value) {
		this.win.focus();
		this.doc.execCommand(command, false, value);
	},
	colorPicker: function(){
		// 255,0,0 
		// 255,0,255
		// 0,0,255 
		// 0,255,255 
		// 0,255,0 
		// 255,255,0
		// 255,0,0
	}
}