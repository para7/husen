import { describe, it, expect } from 'vitest';
import { CreatePasswordHash, CheckPasswordHash } from './CreatePasswordHash';

describe('CreatePasswordHash', () => {
	it('正しくハッシュが生成されることを確認', async () => {
		const password = 'password123';
		const hash = await CreatePasswordHash(password);

		// ハッシュ形式が "salt:iterations:hash" であるかチェック
		const parts = hash.split(':');
		expect(parts).toHaveLength(3);
		expect(parts[0]).toHaveLength(32); // ソルトは16バイトのHexエンコード (32文字)
		expect(parseInt(parts[1])).toBe(10000); // イテレーション回数
		expect(parts[2]).toHaveLength(128); // 64バイトのHexエンコード (128文字)
	});

	it('同じパスワードでも異なるハッシュが生成されることを確認', async () => {
		const password = 'password123';
		const hash1 = await CreatePasswordHash(password);
		const hash2 = await CreatePasswordHash(password);

		expect(hash1).not.toBe(hash2); // ソルトが異なるためハッシュも異なるはず
	});
});

describe('CheckPasswordHash', () => {
	it('正しいパスワードで検証が成功することを確認', async () => {
		const password = 'password123';
		const hash = await CreatePasswordHash(password);
		const isValid = await CheckPasswordHash(password, hash);

		expect(isValid).toBe(true);
	});

	it('間違ったパスワードで検証が失敗することを確認', async () => {
		const password = 'password123';
		const wrongPassword = 'wrongpassword';
		const hash = await CreatePasswordHash(password);
		const isValid = await CheckPasswordHash(wrongPassword, hash);

		expect(isValid).toBe(false);
	});
});
