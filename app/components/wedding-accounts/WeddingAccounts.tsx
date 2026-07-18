'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

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
  const sectionRef = useRef<HTMLElement>(null);
  const copiedTimerRef = useRef<number | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.14,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const copyAccountNumber = async (account: WeddingAccount): Promise<void> => {
    const copyValue = account.accountNumber.replace(/\s/g, '');

    try {
      await navigator.clipboard.writeText(copyValue);
    } catch {
      const textarea = document.createElement('textarea');

      textarea.value = copyValue;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';

      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    setCopiedAccountId(account.id);

    if (copiedTimerRef.current !== null) {
      window.clearTimeout(copiedTimerRef.current);
    }

    copiedTimerRef.current = window.setTimeout(() => {
      setCopiedAccountId(null);
    }, 1500);
  };

  return (
    <section
      ref={sectionRef}
      className={`relative box-border flex w-full translate-y-5 flex-col items-center px-5 py-10 font-[Pretendard,-apple-system,BlinkMacSystemFont,'Apple_SD_Gothic_Neo','Noto_Sans_KR',sans-serif] text-[#333333] opacity-0 transition-[opacity,transform] duration-800 max-[360px]:px-4 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        isVisible ? 'translate-y-0 opacity-100' : ''
      }`}
      aria-labelledby="wedding-accounts-title"
    >
      <Image
        className="mx-auto mb-5 block h-auto w-30.5 object-contain"
        src="/images/message/decoration_ribbon.png"
        alt=""
        width={134}
        height={40}
      />

      <h2
        id="wedding-accounts-title"
        className="m-0 text-center text-2xl font-semibold leading-normal tracking-[-0.045em]"
      >
        {title}
      </h2>

      <ul className="mt-4 flex w-full list-none flex-col p-0">
        <AccountAccordion
          title="신랑측 계좌번호"
          accounts={groomAccounts}
          copiedAccountId={copiedAccountId}
          onCopy={copyAccountNumber}
        />

        <AccountAccordion
          title="신부측 계좌번호"
          accounts={brideAccounts}
          copiedAccountId={copiedAccountId}
          onCopy={copyAccountNumber}
        />
      </ul>

      <span className="sr-only" role="status" aria-live="polite">
        {copiedAccountId ? '계좌번호가 복사되었습니다.' : ''}
      </span>
    </section>
  );
}

type AccountAccordionProps = {
  title: string;
  accounts: WeddingAccount[];
  copiedAccountId: string | null;
  onCopy: (account: WeddingAccount) => void;
};

function AccountAccordion({
  title,
  accounts,
  copiedAccountId,
  onCopy,
}: AccountAccordionProps): React.ReactElement {
  return (
    <li className="mb-2 w-full overflow-hidden">
      <div className="flex min-h-13.5 w-full items-center bg-[#f1f0ee] px-4.25 text-left text-xl font-medium leading-normal tracking-[-0.04em] text-[#333333] max-[360px]:px-3.75">
        {title}
      </div>

      <div className="px-4 pb-4 max-[360px]:px-3.5">
        {accounts.map((account) => {
          const isCopied = copiedAccountId === account.id;

          return (
            <article
              key={account.id}
              className="flex w-full items-center justify-between gap-4 py-4 [&+&]:border-t [&+&]:border-[#e4e2df] max-[360px]:gap-3"
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

              <button
                type="button"
                className={`m-0 shrink-0 cursor-pointer whitespace-nowrap rounded-xs border px-5 py-1.75 ${
                  isCopied
                    ? 'border-[#333333] bg-[#333333] text-white'
                    : 'border-[#d7d4d0] bg-white text-[#555555]'
                }`}
                onClick={() => {
                  onCopy(account);
                }}
                aria-label={`${account.role} ${account.bank} ${account.accountNumber} 복사`}
              >
                {isCopied ? '복사완료' : '복사하기'}
              </button>
            </article>
          );
        })}
      </div>
    </li>
  );
}
