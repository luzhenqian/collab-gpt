type Role = 'user' | 'assistant';

interface Message {
    role: Role;
    content: string;
}
