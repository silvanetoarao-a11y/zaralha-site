using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Oxide.Core;
using Oxide.Core.Plugins;
using UnityEngine;

namespace Oxide.Plugins
{
    [Info("Shop Integration", "GameServers", "2.0.0")]
    [Description("Integração completa da loja com servidor Rust - Sistema de entrega automática")]
    public class ShopIntegration : RustPlugin
    {
        #region Configuração
        
        private Configuration config;
        
        private class Configuration
        {
            public string ApiUrl { get; set; } = "http://localhost:3000/api";
            public string ApiKey { get; set; } = "RUST_PLUGIN_KEY";
            public float CheckInterval { get; set; } = 30f;
            public bool DebugMode { get; set; } = false;
            public bool NotifyOnDelivery { get; set; } = true;
            public bool DropIfInventoryFull { get; set; } = true;
        }
        
        protected override void LoadDefaultConfig()
        {
            config = new Configuration();
            SaveConfig();
        }
        
        private void Init()
        {
            if (Config["ApiUrl"] == null)
            {
                LoadDefaultConfig();
            }
            config = Config.ReadObject<Configuration>();
            SaveConfig();
        }
        
        private void SaveConfig()
        {
            Config.WriteObject(config);
        }
        
        #endregion
        
        #region Variáveis
        
        private Timer deliveryTimer;
        private Timer connectionTimer;
        private bool isConnected = false;
        private int failedAttempts = 0;
        private const int MAX_FAILED_ATTEMPTS = 5;
        
        #endregion
        
        #region Inicialização
        
        private void OnServerInitialized()
        {
            Puts("========================================");
            Puts("Shop Integration v2.0.0 - Carregado!");
            Puts($"API URL: {config.ApiUrl}");
            Puts($"Check Interval: {config.CheckInterval}s");
            Puts("========================================");
            
            // Verificar conexão inicial
            TestConnection();
            
            // Iniciar timer de entregas
            deliveryTimer = timer.Every(config.CheckInterval, CheckPendingDeliveries);
            
            // Timer de verificação de conexão a cada 5 minutos
            connectionTimer = timer.Every(300f, TestConnection);
        }
        
        private void Unload()
        {
            if (deliveryTimer != null)
            {
                deliveryTimer.Destroy();
            }
            if (connectionTimer != null)
            {
                connectionTimer.Destroy();
            }
        }
        
        #endregion
        
        #region Teste de Conexão
        
        private void TestConnection()
        {
            webrequest.Enqueue(
                $"{config.ApiUrl}/rust/status",
                null,
                (code, response) =>
                {
                    if (code == 200)
                    {
                        if (!isConnected)
                        {
                            isConnected = true;
                            failedAttempts = 0;
                            Puts("[Shop Integration] Conexão com a API estabelecida!");
                        }
                    }
                    else
                    {
                        HandleConnectionError(code);
                    }
                },
                this,
                RequestMethod.GET,
                new Dictionary<string, string>
                {
                    { "X-API-Key", config.ApiKey }
                }
            );
        }
        
        private void HandleConnectionError(int code)
        {
            failedAttempts++;
            isConnected = false;
            
            if (config.DebugMode)
            {
                Puts($"[Shop Integration] Erro de conexão: {code} (Tentativa {failedAttempts}/{MAX_FAILED_ATTEMPTS})");
            }
            
            if (failedAttempts >= MAX_FAILED_ATTEMPTS)
            {
                Puts($"[Shop Integration] AVISO: Múltiplas falhas de conexão detectadas! Verifique a configuração da API.");
                failedAttempts = 0; // Reset para tentar novamente
            }
        }
        
        #endregion

        #region Verificação de Entregas
        
        private void CheckPendingDeliveries()
        {
            if (!isConnected && failedAttempts >= MAX_FAILED_ATTEMPTS)
            {
                if (config.DebugMode)
                {
                    Puts("[Shop Integration] Pulando verificação - sem conexão com API");
                }
                return;
            }
            
            webrequest.Enqueue(
                $"{config.ApiUrl}/rust/pending-deliveries",
                null,
                (code, response) => OnDeliveriesReceived(code, response),
                this,
                RequestMethod.GET,
                new Dictionary<string, string>
                {
                    { "X-API-Key", config.ApiKey }
                }
            );
        }

        private void OnDeliveriesReceived(int code, string response)
        {
            if (code != 200)
            {
                HandleConnectionError(code);
                if (config.DebugMode)
                {
                    Puts($"[Shop Integration] Erro ao buscar entregas: {code}");
                }
                return;
            }

            try
            {
                var purchases = JsonConvert.DeserializeObject<List<Purchase>>(response);
                
                if (purchases == null || purchases.Count == 0)
                {
                    if (config.DebugMode)
                    {
                        Puts("[Shop Integration] Nenhuma entrega pendente.");
                    }
                    return;
                }
                
                Puts($"[Shop Integration] {purchases.Count} entrega(s) pendente(s) encontrada(s).");
                
                foreach (var purchase in purchases)
                {
                    DeliverItem(purchase);
                }
            }
            catch (Exception ex)
            {
                Puts($"[Shop Integration] ERRO ao processar entregas: {ex.Message}");
                if (config.DebugMode)
                {
                    Puts($"[Shop Integration] Stack trace: {ex.StackTrace}");
                }
            }
        }
        
        #endregion

        #region Entrega de Itens
        
        private void DeliverItem(Purchase purchase)
        {
            // Converter Steam ID para ulong
            ulong steamId;
            if (!ulong.TryParse(purchase.steamId, out steamId))
            {
                Puts($"[Shop Integration] Steam ID inválido: {purchase.steamId}");
                return;
            }

            // Encontrar jogador pelo Steam ID
            var player = BasePlayer.FindByID(steamId);
            
            if (player == null || !player.IsConnected)
            {
                if (config.DebugMode)
                {
                    Puts($"[Shop Integration] Jogador Steam ID {steamId} não está online. Entrega será tentada novamente.");
                }
                return;
            }

            // Verificar se o Steam ID corresponde
            if (player.userID != steamId)
            {
                Puts($"[Shop Integration] ERRO: Steam ID não corresponde! Esperado: {steamId}, Encontrado: {player.userID}");
                return;
            }

            // Criar item
            var item = ItemManager.CreateByName(purchase.itemId, purchase.itemQuantity);
            
            if (item == null)
            {
                Puts($"[Shop Integration] ERRO: Não foi possível criar o item '{purchase.itemId}'. Verifique se o nome do item está correto.");
                // Marcar como entregue mesmo assim para não ficar tentando infinitamente
                MarkAsDelivered(purchase.id, true);
                return;
            }

            // Tentar adicionar ao inventário
            bool delivered = false;
            
            // Tentar inventário principal primeiro
            if (player.inventory.containerMain != null && player.inventory.containerMain.CanTake(item))
            {
                item.MoveToContainer(player.inventory.containerMain);
                delivered = true;
            }
            // Tentar cinto
            else if (player.inventory.containerBelt != null && player.inventory.containerBelt.CanTake(item))
            {
                item.MoveToContainer(player.inventory.containerBelt);
                delivered = true;
            }
            // Tentar mochila
            else if (player.inventory.containerWear != null && player.inventory.containerWear.CanTake(item))
            {
                item.MoveToContainer(player.inventory.containerWear);
                delivered = true;
            }
            
            // Se não conseguiu adicionar ao inventário
            if (!delivered)
            {
                if (config.DropIfInventoryFull)
                {
                    // Dropar no chão
                    item.Drop(player.transform.position + Vector3.up * 0.5f, Vector3.zero);
                    if (config.NotifyOnDelivery)
                    {
                        player.ChatMessage($"<color=orange>[Loja]</color> Seu inventário estava cheio. O item foi dropado no chão próximo a você.");
                    }
                    delivered = true;
                }
                else
                {
                    // Não entregar e tentar novamente depois
                    Puts($"[Shop Integration] Inventário do jogador {player.displayName} ({steamId}) está cheio. Entrega será tentada novamente.");
                    item.Remove();
                    return;
                }
            }

            // Notificar jogador
            if (config.NotifyOnDelivery && delivered)
            {
                var itemName = item.info.displayName.english;
                player.ChatMessage($"<color=green>[Loja]</color> Item entregue: <color=yellow>{itemName}</color> x<color=yellow>{purchase.itemQuantity}</color>");
            }

            // Log
            if (config.DebugMode)
            {
                Puts($"[Shop Integration] Item '{purchase.itemId}' x{purchase.itemQuantity} entregue para {player.displayName} ({steamId})");
            }

            // Marcar como entregue na API
            MarkAsDelivered(purchase.id, false);
        }

        private void MarkAsDelivered(int purchaseId, bool error = false)
        {
            webrequest.Enqueue(
                $"{config.ApiUrl}/rust/mark-delivered",
                JsonConvert.SerializeObject(new { purchaseId, error }),
                (code, response) =>
                {
                    if (code == 200)
                    {
                        if (config.DebugMode)
                        {
                            Puts($"[Shop Integration] Compra {purchaseId} marcada como entregue na API.");
                        }
                    }
                    else
                    {
                        Puts($"[Shop Integration] ERRO ao marcar compra {purchaseId} como entregue: {code}");
                    }
                },
                this,
                RequestMethod.POST,
                new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" },
                    { "X-API-Key", config.ApiKey }
                }
            );
        }
        
        #endregion
        
        #region Comandos de Chat
        
        [ChatCommand("shopstatus")]
        private void ShopStatusCommand(BasePlayer player, string command, string[] args)
        {
            if (!player.IsAdmin)
            {
                player.ChatMessage("Você não tem permissão para usar este comando.");
                return;
            }
            
            player.ChatMessage($"=== Status da Loja ===");
            player.ChatMessage($"Conexão: {(isConnected ? "<color=green>Conectado</color>" : "<color=red>Desconectado</color>")}");
            player.ChatMessage($"API URL: {config.ApiUrl}");
            player.ChatMessage($"Intervalo de verificação: {config.CheckInterval}s");
            player.ChatMessage($"Tentativas falhas: {failedAttempts}/{MAX_FAILED_ATTEMPTS}");
        }
        
        [ChatCommand("shopreload")]
        private void ShopReloadCommand(BasePlayer player, string command, string[] args)
        {
            if (!player.IsAdmin)
            {
                player.ChatMessage("Você não tem permissão para usar este comando.");
                return;
            }
            
            // Recarregar configuração
            config = Config.ReadObject<Configuration>();
            
            // Reiniciar timers
            if (deliveryTimer != null) deliveryTimer.Destroy();
            if (connectionTimer != null) connectionTimer.Destroy();
            
            deliveryTimer = timer.Every(config.CheckInterval, CheckPendingDeliveries);
            connectionTimer = timer.Every(300f, TestConnection);
            
            // Testar conexão
            TestConnection();
            
            player.ChatMessage("<color=green>Configuração da loja recarregada!</color>");
        }
        
        #endregion

        #region Classes de Dados
        
        private class Purchase
        {
            public int id { get; set; }
            public string steamId { get; set; }
            public string productId { get; set; }
            public string itemId { get; set; }
            public int itemQuantity { get; set; }
            public string status { get; set; }
        }
        
        #endregion
    }
}
