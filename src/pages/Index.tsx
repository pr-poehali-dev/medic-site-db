import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  email: string;
  full_name: string;
}

interface Doctor {
  id: number;
  full_name: string;
  specialization: string;
  experience_years: number;
  description: string;
}

interface Service {
  id: number;
  title: string;
  description: string;
  price: string;
  duration_minutes: number;
}

interface Appointment {
  id: number;
  symptoms: string;
  status: string;
  scheduled_date: string;
  doctor_name: string;
  specialization: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function Index() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [faq, setFaq] = useState<FAQ[]>([]);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    fetchDoctors();
    fetchServices();
    fetchFAQ();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchDoctors = async () => {
    const response = await fetch('https://functions.poehali.dev/833dba9a-563e-4ca8-86a2-873b2514bdaa');
    const data = await response.json();
    setDoctors(data);
  };

  const fetchServices = async () => {
    const response = await fetch('https://functions.poehali.dev/7ea51656-08d5-405f-b1e2-4217c3afb860');
    const data = await response.json();
    setServices(data);
  };

  const fetchFAQ = async () => {
    const response = await fetch('https://functions.poehali.dev/642bdee0-1640-47fc-b795-2e30be9af142');
    const data = await response.json();
    setFaq(data);
  };

  const fetchAppointments = async () => {
    if (!user) return;
    const response = await fetch(`https://functions.poehali.dev/419efb75-a310-4f7a-bc78-d477b8ef7d6b?user_id=${user.id}`);
    const data = await response.json();
    setAppointments(data);
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      action: authMode,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      ...(authMode === 'register' && {
        full_name: formData.get('full_name') as string,
        phone: formData.get('phone') as string,
      })
    };

    const response = await fetch('https://functions.poehali.dev/b5591eeb-ee21-4db5-bdc2-8727f459a2cd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      toast({
        title: authMode === 'login' ? 'Вход выполнен' : 'Регистрация успешна',
        description: `Добро пожаловать, ${data.user.full_name}!`
      });
    } else {
      toast({
        title: 'Ошибка',
        description: data.error,
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    toast({ title: 'Выход выполнен' });
  };

  const handleAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    
    const payload = {
      user_id: user.id,
      symptoms: formData.get('symptoms') as string,
      service_id: parseInt(formData.get('service_id') as string)
    };

    const response = await fetch('https://functions.poehali.dev/419efb75-a310-4f7a-bc78-d477b8ef7d6b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (response.ok) {
      toast({
        title: 'Обращение создано',
        description: `Вам назначен врач: ${data.doctor.name}`
      });
      fetchAppointments();
      (e.target as HTMLFormElement).reset();
    } else {
      toast({
        title: 'Ошибка',
        description: data.error,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveSection('home')}>
            <Icon name="HeartPulse" size={32} className="text-primary" />
            <h1 className="text-2xl font-bold text-primary">МедиКлиника</h1>
          </div>
          
          <nav className="hidden md:flex gap-6">
            <button onClick={() => setActiveSection('home')} className={`${activeSection === 'home' ? 'text-primary font-semibold' : 'text-foreground'} hover:text-primary transition`}>Главная</button>
            <button onClick={() => setActiveSection('doctors')} className={`${activeSection === 'doctors' ? 'text-primary font-semibold' : 'text-foreground'} hover:text-primary transition`}>Врачи</button>
            <button onClick={() => setActiveSection('services')} className={`${activeSection === 'services' ? 'text-primary font-semibold' : 'text-foreground'} hover:text-primary transition`}>Услуги</button>
            <button onClick={() => setActiveSection('schedule')} className={`${activeSection === 'schedule' ? 'text-primary font-semibold' : 'text-foreground'} hover:text-primary transition`}>Расписание</button>
            <button onClick={() => setActiveSection('appointments')} className={`${activeSection === 'appointments' ? 'text-primary font-semibold' : 'text-foreground'} hover:text-primary transition`}>Обращения</button>
            <button onClick={() => setActiveSection('faq')} className={`${activeSection === 'faq' ? 'text-primary font-semibold' : 'text-foreground'} hover:text-primary transition`}>FAQ</button>
          </nav>

          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{user.full_name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти
                </Button>
              </div>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="User" size={16} className="mr-2" />
                    Войти
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{authMode === 'login' ? 'Вход' : 'Регистрация'}</DialogTitle>
                    <DialogDescription>
                      {authMode === 'login' ? 'Войдите в личный кабинет' : 'Создайте учетную запись'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleAuth} className="space-y-4">
                    {authMode === 'register' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="full_name">ФИО</Label>
                          <Input id="full_name" name="full_name" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Телефон</Label>
                          <Input id="phone" name="phone" type="tel" />
                        </div>
                      </>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Пароль</Label>
                      <Input id="password" name="password" type="password" required />
                    </div>

                    <Button type="submit" className="w-full">
                      {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                      className="text-sm text-muted-foreground hover:text-primary w-full text-center"
                    >
                      {authMode === 'login' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
                    </button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {activeSection === 'home' && (
          <div className="space-y-16">
            <section className="text-center space-y-6">
              <h2 className="text-5xl font-bold text-primary">Забота о вашем здоровье</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Современная медицинская клиника с опытными врачами и новейшим оборудованием
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button size="lg" onClick={() => setActiveSection('appointments')}>
                  <Icon name="Calendar" size={20} className="mr-2" />
                  Записаться на прием
                </Button>
                <Button size="lg" variant="outline" onClick={() => setActiveSection('doctors')}>
                  <Icon name="Users" size={20} className="mr-2" />
                  Наши врачи
                </Button>
              </div>
            </section>

            <section className="grid md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon name="Award" size={48} className="mx-auto text-primary mb-4" />
                  <CardTitle>Опытные специалисты</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Врачи высшей категории с многолетним стажем</p>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon name="Clock" size={48} className="mx-auto text-primary mb-4" />
                  <CardTitle>Удобное время</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Работаем ежедневно с 8:00 до 21:00</p>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon name="Shield" size={48} className="mx-auto text-primary mb-4" />
                  <CardTitle>Гарантия качества</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Современное оборудование и проверенные методики</p>
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {activeSection === 'doctors' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-primary">Наши врачи</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map(doctor => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon name="User" size={40} className="text-primary" />
                    </div>
                    <CardTitle className="text-center">{doctor.full_name}</CardTitle>
                    <CardDescription className="text-center">{doctor.specialization}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Briefcase" size={16} className="text-muted-foreground" />
                      <span>Стаж: {doctor.experience_years} лет</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{doctor.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'services' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-primary">Услуги</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {services.map(service => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{service.title}</CardTitle>
                        <CardDescription className="mt-2">{service.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-lg font-bold whitespace-nowrap ml-4">
                        {parseFloat(service.price).toLocaleString('ru-RU')} ₽
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Clock" size={16} />
                      <span>Продолжительность: {service.duration_minutes} мин</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'schedule' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-primary">Расписание работы</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Icon name="Calendar" size={24} className="text-primary" />
                      Режим работы
                    </h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="flex justify-between"><span>Понедельник - Пятница:</span><span className="font-medium">8:00 - 21:00</span></p>
                      <p className="flex justify-between"><span>Суббота:</span><span className="font-medium">9:00 - 18:00</span></p>
                      <p className="flex justify-between"><span>Воскресенье:</span><span className="font-medium">10:00 - 16:00</span></p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Icon name="Phone" size={24} className="text-primary" />
                      Контакты
                    </h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Icon name="Phone" size={16} />
                        +7 (495) 123-45-67
                      </p>
                      <p className="flex items-center gap-2">
                        <Icon name="Mail" size={16} />
                        info@mediclinic.ru
                      </p>
                      <p className="flex items-center gap-2">
                        <Icon name="MapPin" size={16} />
                        г. Москва, ул. Здоровья, д. 1
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'appointments' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-primary">Обращения</h2>
            
            {user ? (
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Создать обращение</CardTitle>
                    <CardDescription>Опишите ваши симптомы, и мы назначим подходящего врача</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAppointment} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="service_id">Услуга</Label>
                        <select
                          id="service_id"
                          name="service_id"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          required
                        >
                          <option value="">Выберите услугу</option>
                          {services.map(service => (
                            <option key={service.id} value={service.id}>
                              {service.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="symptoms">Симптомы / Жалобы</Label>
                        <Textarea
                          id="symptoms"
                          name="symptoms"
                          placeholder="Опишите, что вас беспокоит..."
                          rows={5}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        <Icon name="Send" size={16} className="mr-2" />
                        Отправить обращение
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Мои обращения</h3>
                  {appointments.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        У вас пока нет обращений
                      </CardContent>
                    </Card>
                  ) : (
                    appointments.map(appointment => (
                      <Card key={appointment.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{appointment.doctor_name}</CardTitle>
                              <CardDescription>{appointment.specialization}</CardDescription>
                            </div>
                            <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                              {appointment.status === 'confirmed' ? 'Подтверждено' : 'В обработке'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm"><strong>Симптомы:</strong> {appointment.symptoms}</p>
                          <p className="text-sm text-muted-foreground">
                            <Icon name="Calendar" size={14} className="inline mr-1" />
                            {new Date(appointment.scheduled_date).toLocaleString('ru-RU')}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Icon name="Lock" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground mb-4">Войдите, чтобы создать обращение</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Войти</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Вход</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email-login">Email</Label>
                          <Input id="email-login" name="email" type="email" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password-login">Пароль</Label>
                          <Input id="password-login" name="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">Войти</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeSection === 'faq' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-primary">Вопросы и ответы</h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faq.map((item, index) => (
                  <AccordionItem key={item.id} value={`item-${index}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-start gap-3">
                        <Icon name="HelpCircle" size={20} className="text-primary mt-1 flex-shrink-0" />
                        <span className="font-semibold">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-8">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-primary text-primary-foreground mt-20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">МедиКлиника</h3>
              <p className="text-sm opacity-90">Забота о вашем здоровье — наша главная миссия</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="space-y-2 text-sm opacity-90">
                <p>+7 (495) 123-45-67</p>
                <p>info@mediclinic.ru</p>
                <p>г. Москва, ул. Здоровья, д. 1</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Режим работы</h4>
              <div className="space-y-2 text-sm opacity-90">
                <p>Пн-Пт: 8:00 - 21:00</p>
                <p>Сб: 9:00 - 18:00</p>
                <p>Вс: 10:00 - 16:00</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm opacity-75">
            <p>&copy; 2025 МедиКлиника. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}