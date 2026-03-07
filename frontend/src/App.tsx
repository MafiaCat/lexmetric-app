import { useAuth } from './context/AuthContext';
import { DemoLogin } from './features/auth/DemoLogin';
import { UserApp } from './UserApp';
import { ModeratorApp } from './ModeratorApp';

function App() {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <DemoLogin />;
    }

    if (user?.role === 'admin') {
        return <ModeratorApp />;
    }

    return <UserApp />;
}

export default App;
