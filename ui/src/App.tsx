import "twin.macro";
import { Login } from "./stories/Login";
import { Notification } from "./stories/Notification";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Notifications } from "./stories/Notifications";
import { Controls } from "./stories/Controls";
import { Button } from "./stories/Button";
import { Card } from "./stories/Card";

const queryClient = new QueryClient();

const username = "Jerred";
const players = 3;
const period = 60;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <div tw="flex flex-col justify-center h-full gap-y-5">
      <Login />
      <Controls period={period} players={players} />
      <Card title="Status">
        <div>There are {players} others connected</div>
        <div>You've used up 57% of your commands</div>
        <div>Your ping is 53ms</div>
      </Card>
      <Button>Take Screenshot</Button>
    </div>
    <Notifications>
      <Notification type="success" title="Authentication Successful" message={`Logged in as ${username}`} />
      <Notification type="info" title="Welcome Back!" message={`Logged in as ${username}`} />
      <Notification
        type="info"
        title="Connection Established"
        message={`Connected to Pokébot with ${players} others`}
      />
      <Notification type="error" title="No Connection" message="Is Pokébot online?" dismissable={false} />
      <Notification
        type="warning"
        title="Attempting to Reconnect"
        message="Your connection was interrupted"
        dismissable={false}
      />
      <Notification
        type="warning"
        title="You're being Throttled"
        message="You've sent more than your share of commands! Your commands may be interrupted by other players."
      />
      <Notification type="error" title="Invalid Token" message="Try generating a new token" />
    </Notifications>
  </QueryClientProvider>
);

export default App;
