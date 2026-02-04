
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export function AuthForm() {
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerUsername, setRegisterUsername] = useState('');

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        const { error } = await signInWithGoogle();
        if (error) {
            toast.error(error.message);
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await signIn(loginEmail, loginPassword);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Bem-vindo de volta! 🎮');
        }

        setIsLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (registerUsername.length < 3) {
            toast.error('O nome de usuário deve ter pelo menos 3 caracteres');
            setIsLoading(false);
            return;
        }

        const { error } = await signUp(registerEmail, registerPassword, registerUsername);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Conta criada! Verifique seu email. 📧');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 pattern-grid">
            <Card className="w-full max-w-md pixel-border shadow-xl bg-card/95 backdrop-blur">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tighter glow-text">TasKLegends.</CardTitle>
                    <CardDescription>Sua produtividade, gamificada.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Social Login Section */}
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full pixel-border border-[#3d2b7a]/30 h-11 bg-white hover:bg-zinc-50 text-zinc-900 font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    style={{ fill: '#4285F4' }}
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    style={{ fill: '#34A853' }}
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                    style={{ fill: '#FBBC05' }}
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    style={{ fill: '#EA4335' }}
                                />
                            </svg>
                            CONTINUAR COM GOOGLE
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[#3d2b7a]/20" />
                            </div>
                            <div className="relative flex justify-center text-[8px] uppercase font-black">
                                <span className="bg-card px-2 text-muted-foreground">Ou use seu pergaminho</span>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="login" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2 pixel-border">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Cadastro</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="space-y-4">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="heroi@exemplo.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                        className="pixel-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Senha</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                        className="pixel-border"
                                    />
                                </div>
                                <Button type="submit" className="w-full pixel-button" disabled={isLoading}>
                                    {isLoading ? 'Entrando...' : 'Entrar na Aventura'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register" className="space-y-4">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-username">Nome de Herói</Label>
                                    <Input
                                        id="register-username"
                                        placeholder="SuperProdutivo"
                                        value={registerUsername}
                                        onChange={(e) => setRegisterUsername(e.target.value)}
                                        required
                                        className="pixel-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-email">Email</Label>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="heroi@exemplo.com"
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                        required
                                        className="pixel-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-password">Senha</Label>
                                    <Input
                                        id="register-password"
                                        type="password"
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                        required
                                        className="pixel-border"
                                    />
                                </div>
                                <Button type="submit" className="w-full pixel-button" disabled={isLoading}>
                                    {isLoading ? 'Criando Personagem...' : 'Começar Jornada'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-xs text-muted-foreground text-center px-4">
                        Ao entrar, você concorda em completar suas tarefas e derrotar monstros! ⚔️
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
