'use client';

import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'sonner';
import WeddingSectionHeader from '../common/WeddingSectionHeader';

export type WeddingAccount = {
  id: string;
  role: string;
  holder: string;
  bank: string;
  accountNumber: string;
};

type WeddingAccountsProps = {
  title?: string;
  groomAccounts?: WeddingAccount[];
  brideAccounts?: WeddingAccount[];
};

const DEFAULT_GROOM_ACCOUNTS: WeddingAccount[] = [
  {
    id: 'groom',
    role: '신랑',
    accountNumber: '3333-13-3538206',
    bank: '카카오뱅크',
    holder: '지웅재',
  },
  {
    id: 'groom-mother',
    role: '신랑 어머니',
    accountNumber: '3333-21-0312583',
    bank: '카카오뱅크',
    holder: '박순영',
  },
];

const DEFAULT_BRIDE_ACCOUNTS: WeddingAccount[] = [
  {
    id: 'bride',
    role: '신부',
    accountNumber: '3333-04-3426904',
    bank: '카카오뱅크',
    holder: '송혜정',
  },
  {
    id: 'bride-father',
    role: '신부 아버지',
    accountNumber: '3120031056611',
    bank: '농협은행',
    holder: '송종무',
  },
  {
    id: 'bride-mother',
    role: '신부 어머니',
    accountNumber: '70902074370',
    bank: '수협',
    holder: '지경화',
  },
];

export default function WeddingAccounts({
  title = '마음 전하실 곳',
  groomAccounts = DEFAULT_GROOM_ACCOUNTS,
  brideAccounts = DEFAULT_BRIDE_ACCOUNTS,
}: WeddingAccountsProps): React.ReactElement {
  return (
    <section
      className="relative box-border flex w-full flex-col items-center px-5 py-10 font-[Pretendard,-apple-system,BlinkMacSystemFont,'Apple_SD_Gothic_Neo','Noto_Sans_KR',sans-serif] text-[#333333]"
      aria-labelledby="wedding-accounts-title"
    >
      <WeddingSectionHeader id="wedding-accounts-title" title={title} />

      <ul className="mt-8.5 flex w-full list-none flex-col p-0">
        <AccountAccordion title="신랑측 계좌번호" accounts={groomAccounts} />
        <AccountAccordion title="신부측 계좌번호" accounts={brideAccounts} />
      </ul>
    </section>
  );
}

type AccountAccordionProps = {
  title: string;
  accounts: WeddingAccount[];
};

function AccountAccordion({
  title,
  accounts,
}: AccountAccordionProps): React.ReactElement {
  return (
    <li className="mb-2 w-full overflow-hidden">
      <div className="flex min-h-13.5 w-full items-center bg-[#f1f0ee] px-4.25 text-left text-xl font-medium leading-normal tracking-[-0.04em] text-[#333333]">
        {title}
      </div>

      <div className="px-4 pb-4">
        {accounts.map((account) => {
          const copyValue = `${account.bank} ${account.accountNumber}`;

          return (
            <article
              key={account.id}
              className="flex w-full items-center justify-between gap-4 py-4 [&+&]:border-t [&+&]:border-[#e4e2df]"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="block text-xl font-bold leading-normal tracking-[-0.045em] text-[#333333]">
                  {account.role}
                </span>

                <span className="mt-1.5 block break-all text-lg leading-normal tracking-tight text-[#333333]">
                  {account.accountNumber}
                </span>

                <span className="mt-1 block font-normal leading-normal tracking-[-0.035em] text-[#777777]">
                  {account.bank} {account.holder}
                </span>
              </div>

              <CopyToClipboard
                text={copyValue}
                onCopy={(_, copied) => {
                  if (copied) {
                    toast.success('은행명과 계좌번호가 복사되었습니다.');
                    return;
                  }

                  toast.error('복사에 실패했습니다.');
                }}
              >
                <button
                  type="button"
                  className="m-0 shrink-0 cursor-pointer whitespace-nowrap rounded-xs border border-[#d7d4d0] bg-white px-5 py-1.75 text-[#555555]"
                  aria-label={`${account.role} ${account.bank} ${account.accountNumber} 복사`}
                >
                  복사하기
                </button>
              </CopyToClipboard>
            </article>
          );
        })}
      </div>
    </li>
  );
}
