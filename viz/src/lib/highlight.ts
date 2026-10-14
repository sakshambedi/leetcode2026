// Minimal Python highlighter: one HTML string per line, colored by theme tokens in app.css.

const KEYWORDS = new Set(
	'and as assert break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield'.split(' ')
);
const BUILTINS = new Set(
	'abs all any dict enumerate filter int len list map max min print range reversed set sorted str sum tuple zip'.split(' ')
);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function highlightPython(line: string) {
	const re = /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|([=<>!+\-*/%]+)|([\s\S])/g;
	let out = '';
	let m: RegExpExecArray | null;
	while ((m = re.exec(line))) {
		const [tok, comment, str, num, name, op] = m;
		if (comment) out += `<span class="tk-comment">${esc(tok)}</span>`;
		else if (str) out += `<span class="tk-str">${esc(tok)}</span>`;
		else if (num) out += `<span class="tk-num">${tok}</span>`;
		else if (name && KEYWORDS.has(name)) out += `<span class="tk-kw">${tok}</span>`;
		else if (name && (BUILTINS.has(name) || /^\s*\(/.test(line.slice(re.lastIndex))))
			out += `<span class="tk-fn">${tok}</span>`;
		else if (op) out += `<span class="tk-op">${esc(tok)}</span>`;
		else out += esc(tok);
	}
	return out;
}

export function highlight(code: string, lang = 'python') {
	return code
		.replace(/\n$/, '')
		.split('\n')
		.map((l) => (lang === 'python' ? highlightPython(l) : esc(l)));
}
