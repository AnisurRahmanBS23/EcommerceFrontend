import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { MessageService } from 'primeng/api';

export interface OrderNotification {
    orderId: string;
    userId: string;
    status: string;
    message: string;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private hubConnection: HubConnection | null = null;
    private connectionStatus = new BehaviorSubject<HubConnectionState>(HubConnectionState.Disconnected);

    // Expose connection status
    public connectionStatus$ = this.connectionStatus.asObservable();

    constructor(
        private authService: AuthService,
        private messageService: MessageService
    ) {
        // Reconnect when user logs in
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.startConnection(user.userId);
            } else {
                this.stopConnection();
            }
        });
    }

    public async startConnection(userId: string): Promise<void> {
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            return;
        }

        this.hubConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:5000/hub/notifications') // Matches Gateway route
            .withAutomaticReconnect()
            .build();

        this.hubConnection.onreconnecting(() => {
            this.connectionStatus.next(HubConnectionState.Reconnecting);
            console.warn('SignalR Reconnecting...');
        });

        this.hubConnection.onreconnected(() => {
            this.connectionStatus.next(HubConnectionState.Connected);
            console.log('SignalR Reconnected');
            if (userId) {
                this.joinGroup(userId);
            }
        });

        this.hubConnection.onclose(() => {
            this.connectionStatus.next(HubConnectionState.Disconnected);
            console.log('SignalR Connection closed');
        });

        this.hubConnection.on('ReceiveOrderUpdate', (notification: OrderNotification) => {
            console.log('Notification Received:', notification);

            this.messageService.add({
                severity: 'info',
                summary: `Order ${notification.status}`,
                detail: notification.message,
                life: 5000,
                key: 'global-toast'
            });
        });

        try {
            await this.hubConnection.start();
            this.connectionStatus.next(HubConnectionState.Connected);
            console.log('SignalR Connected');
            await this.joinGroup(userId);
        } catch (err) {
            console.error('Error while starting SignalR connection: ' + err);
            this.connectionStatus.next(HubConnectionState.Disconnected);
        }
    }

    public async stopConnection(): Promise<void> {
        if (this.hubConnection) {
            await this.hubConnection.stop();
            this.hubConnection = null;
            this.connectionStatus.next(HubConnectionState.Disconnected);
        }
    }

    private async joinGroup(userId: string): Promise<void> {
        if (this.hubConnection && this.hubConnection.state === HubConnectionState.Connected) {
            try {
                await this.hubConnection.invoke('JoinUserGroup', userId);
                console.log(`Joined group User_${userId}`);
            } catch (err) {
                console.error('Error joining group: ' + err);
            }
        }
    }
}
