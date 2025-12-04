#!/usr/bin/env node

/**
 * 관리자 계정 생성 SQL 생성 스크립트
 */

const crypto = require('crypto');

// 간단한 bcrypt 대체 (SHA-256 해시)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const email = 'hompystory@gmail.com';
const password = 'a1226119';
const passwordHash = hashPassword(password);

console.log('');
console.log('='.repeat(70));
console.log('📋 Supabase 관리자 계정 등록 SQL');
console.log('='.repeat(70));
console.log('');
console.log('👤 계정 정보:');
console.log(`   - Email: ${email}`);
console.log(`   - Password: ${password}`);
console.log(`   - Role: super_admin`);
console.log(`   - Subscription: premium`);
console.log('');
console.log('🔐 Password Hash (SHA-256):');
console.log(`   ${passwordHash}`);
console.log('');
console.log('='.repeat(70));
console.log('📝 Supabase SQL Editor에서 실행할 SQL:');
console.log('='.repeat(70));
console.log('');
console.log('-- 1. users 테이블 생성 (이미 있다면 SKIP)');
console.log('CREATE TABLE IF NOT EXISTS users (');
console.log('  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),');
console.log('  email TEXT UNIQUE NOT NULL,');
console.log('  password TEXT NOT NULL,');
console.log('  name TEXT NOT NULL,');
console.log('  role TEXT DEFAULT \'user\',');
console.log('  subscription_status TEXT DEFAULT \'trial\',');
console.log('  trial_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL \'7 days\'),');
console.log('  created_at TIMESTAMP DEFAULT NOW(),');
console.log('  updated_at TIMESTAMP DEFAULT NOW()');
console.log(');');
console.log('');
console.log('-- 2. user_settings 테이블 생성 (이미 있다면 SKIP)');
console.log('CREATE TABLE IF NOT EXISTS user_settings (');
console.log('  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),');
console.log('  user_id UUID REFERENCES users(id) ON DELETE CASCADE,');
console.log('  gemini_api_key TEXT,');
console.log('  minimax_api_key TEXT,');
console.log('  minimax_group_id TEXT,');
console.log('  shotstack_api_key TEXT,');
console.log('  created_at TIMESTAMP DEFAULT NOW(),');
console.log('  updated_at TIMESTAMP DEFAULT NOW()');
console.log(');');
console.log('');
console.log('-- 3. 관리자 계정 삽입/업데이트');
console.log('INSERT INTO users (email, password, name, role, subscription_status)');
console.log('VALUES (');
console.log(`  '${email}',`);
console.log(`  '${passwordHash}',`);
console.log(`  '관리자',`);
console.log(`  'super_admin',`);
console.log(`  'premium'`);
console.log(') ON CONFLICT (email) DO UPDATE SET');
console.log('  password = EXCLUDED.password,');
console.log('  name = EXCLUDED.name,');
console.log('  role = EXCLUDED.role,');
console.log('  subscription_status = EXCLUDED.subscription_status,');
console.log('  updated_at = NOW();');
console.log('');
console.log('-- 4. 관리자 설정 초기화 (API 키 저장용)');
console.log('INSERT INTO user_settings (user_id, gemini_api_key, minimax_api_key, minimax_group_id, shotstack_api_key)');
console.log('SELECT id, NULL, NULL, NULL, NULL FROM users WHERE email = \'' + email + '\'');
console.log('ON CONFLICT DO NOTHING;');
console.log('');
console.log('='.repeat(70));
console.log('');
console.log('✅ 완료! 위의 SQL을 복사하여 Supabase SQL Editor에서 실행하세요.');
console.log('   URL: https://supabase.com/dashboard/project/rauhoefqchpgwmgspfp/sql/new');
console.log('');
