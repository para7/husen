import crypto from 'crypto';

/**
 * パスワードをハッシュ化する関数(Promise)
 * @param password - 平文のパスワード
 * @returns salt:iterations:hash の形式のハッシュ文字列
 */
export async function CreatePasswordHash(password: string): Promise<string> {
	const salt = crypto.randomBytes(16).toString('hex');
	const iterations = 10000;
	const keyLength = 64;
	const digest = 'sha256';

	return new Promise((resolve, reject) => {
		crypto.pbkdf2(password, salt, iterations, keyLength, digest, (err, derivedKey) => {
			if (err) reject(err);
			const hash = derivedKey.toString('hex');
			resolve(`${salt}:${iterations}:${hash}`);
		});
	});
}

/**
 * ハッシュ済みパスワードと入力パスワードが一致するか確認する関数
 * @param password - 平文のパスワード
 * @param hash - salt:iterations:hash の形式のハッシュ文字列
 * @returns パスワードが一致すれば true, そうでなければ false
 */
export async function CheckPasswordHash(password: string, hash: string): Promise<boolean> {
	const [salt, iterations, savedHash] = hash.split(':');
	const keyLength = 64;
	const digest = 'sha256';

	return new Promise((resolve, reject) => {
		crypto.pbkdf2(password, salt, parseInt(iterations), keyLength, digest, (err, derivedKey) => {
			if (err) reject(err);
			const inputHash = derivedKey.toString('hex');
			resolve(inputHash === savedHash);
		});
	});
}
