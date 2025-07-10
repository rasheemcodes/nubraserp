'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

// Simple OTP input component (6 digits)
function OtpInput({
  length = 6,
  onChange,
  isLoading,
}: {
  length?: number;
  onChange: (code: string) => void;
  isLoading?: boolean;
}) {
  const [values, setValues] = useState(Array(length).fill(''));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (i: number, v: string) => {
    if (!/^[0-9]?$/.test(v)) return;
    const newValues = [...values];
    newValues[i] = v;
    setValues(newValues);
    if (v && i < length - 1) {
      inputs.current[i + 1]?.focus();
    }
    onChange(newValues.join(''));
  };

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !values[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <Input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          className="w-10 h-12 text-center text-lg"
          value={values[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={isLoading}
          autoFocus={i === 0}
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const { isLoading, isAuthenticated, sendOtp: sendOtpAuth, verifyOtp: verifyOtpAuth } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render login form if authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleSendOtp = async (phoneValue: string) => {
    try {
      setIsSendingOtp(true);
      await sendOtpAuth(phoneValue);
      setPhone(phoneValue);
      setStep('otp');
    } catch {
      // Error is already handled in the auth context
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (phone: string, code: string) => {
    try {
      setIsVerifyingOtp(true);
      await verifyOtpAuth(phone, code);
      // Success is handled in the auth context (redirect to /)
    } catch {
      // Error is already handled in the auth context
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn('flex flex-col gap-6', className)} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                {step === 'phone'
                  ? 'Enter your phone below to login to your account'
                  : `Enter the 6-digit OTP sent to ${phone}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'phone' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const phoneValue = form.phone.value.trim();
                    if (phoneValue) {
                      handleSendOtp(phoneValue);
                    } else {
                      toast.error('Please enter a valid phone number.');
                    }
                  }}
                >
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+971 50 123 4567"
                        required
                        disabled={isSendingOtp}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSendingOtp}
                      >
                        {isSendingOtp ? 'Sending...' : 'Login'}
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (otp.length === 6) {
                      handleVerifyOtp(phone, otp);
                    } else {
                      toast.error('Please enter the 6-digit OTP code.');
                    }
                  }}
                >
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="otp">OTP Code</Label>
                      <OtpInput
                        length={6}
                        onChange={setOtp}
                        isLoading={isVerifyingOtp}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={
                          otp.length !== 6 || isVerifyingOtp
                        }
                      >
                        {isVerifyingOtp
                          ? 'Verifying...'
                          : 'Verify OTP'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-xs"
                        disabled={isSendingOtp}
                        onClick={() => {
                          setOtp('');
                          handleSendOtp(phone);
                        }}
                      >
                        Resend OTP
                      </Button>
                      <Button
                        type="button"
                        variant="link"
                        className="w-full text-xs"
                        onClick={() => {
                          setStep('phone');
                          setOtp('');
                          setPhone('');
                        }}
                      >
                        Change phone number
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
