using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Oxide.Core;
using Oxide.Core.Plugins;
using UnityEngine;

namespace Oxide.Plugins
{
    [Info("Shop Integration", "GameServers", "1.0.0")]
    [Description("Integração da loja com servidor Rust")]
    public class ShopIntegration : RustPlugin
    {
        private const string API_URL = "http://localhost:3000/api";
        private const string API_KEY = "RUST_PLUGIN_KEY";
        private Timer deliveryTimer;

        private void Init()
        {
            // Verificar entregas pendentes a cada 30 segundos
            deliveryTimer = timer.Every(30f, CheckPendingDeliveries);
        }

        private void OnServerInitialized()
        {
            Puts("Shop Integration plugin carregado!");
            CheckPendingDeliveries();
        }

        private void Unload()
        {
            if (deliveryTimer != null)
            {
                deliveryTimer.Destroy();
            }
        }

        private void CheckPendingDeliveries()
        {
            webrequest.Enqueue(
                $"{API_URL}/rust/pending-deliveries",
                null,
                (code, response) => OnDeliveriesReceived(code, response),
                this,
                RequestMethod.GET,
                new Dictionary<string, string>
                {
                    { "X-API-Key", API_KEY }
                }
            );
        }

        private void OnDeliveriesReceived(int code, string response)
        {
            if (code != 200)
            {
                Puts($"Erro ao buscar entregas: {code}");
                return;
            }

            try
            {
                var purchases = JsonConvert.DeserializeObject<List<Purchase>>(response);
                
                foreach (var purchase in purchases)
                {
                    DeliverItem(purchase);
                }
            }
            catch (Exception ex)
            {
                Puts($"Erro ao processar entregas: {ex.Message}");
            }
        }

        private void DeliverItem(Purchase purchase)
        {
            // Encontrar jogador pelo Steam ID
            var player = BasePlayer.FindByID(Convert.ToUInt64(purchase.steamId));
            
            if (player == null || !player.IsConnected)
            {
                Puts($"Jogador com Steam ID {purchase.steamId} não está online. Entrega será tentada novamente.");
                return;
            }

            // Converter Steam ID para ulong
            ulong steamId;
            if (!ulong.TryParse(purchase.steamId, out steamId))
            {
                Puts($"Steam ID inválido: {purchase.steamId}");
                return;
            }

            // Verificar se o Steam ID corresponde
            if (player.userID != steamId)
            {
                Puts($"Steam ID não corresponde! Esperado: {steamId}, Encontrado: {player.userID}");
                return;
            }

            // Entregar item
            var item = ItemManager.CreateByName(purchase.itemId, purchase.itemQuantity);
            
            if (item == null)
            {
                Puts($"Erro ao criar item: {purchase.itemId}");
                return;
            }

            // Adicionar ao inventário do jogador
            if (player.inventory.containerMain != null)
            {
                if (!player.inventory.containerMain.CanTake(item))
                {
                    // Tentar adicionar ao inventário de mochila
                    if (player.inventory.containerBelt != null && player.inventory.containerBelt.CanTake(item))
                    {
                        item.MoveToContainer(player.inventory.containerBelt);
                    }
                    else
                    {
                        // Dropar no chão se não houver espaço
                        item.Drop(player.transform.position + Vector3.up, Vector3.zero);
                        player.ChatMessage($"Seu item foi entregue mas seu inventário estava cheio. O item foi dropado no chão.");
                    }
                }
                else
                {
                    item.MoveToContainer(player.inventory.containerMain);
                }
            }

            // Notificar jogador
            player.ChatMessage($"Item entregue: {item.info.displayName.english} x{purchase.itemQuantity}");

            // Marcar como entregue na API
            MarkAsDelivered(purchase.id);
        }

        private void MarkAsDelivered(int purchaseId)
        {
            webrequest.Enqueue(
                $"{API_URL}/rust/mark-delivered",
                JsonConvert.SerializeObject(new { purchaseId }),
                (code, response) =>
                {
                    if (code == 200)
                    {
                        Puts($"Compra {purchaseId} marcada como entregue.");
                    }
                    else
                    {
                        Puts($"Erro ao marcar compra {purchaseId} como entregue: {code}");
                    }
                },
                this,
                RequestMethod.POST,
                new Dictionary<string, string>
                {
                    { "Content-Type", "application/json" },
                    { "X-API-Key", API_KEY }
                }
            );
        }

        // Classes para deserialização JSON
        private class Purchase
        {
            public int id { get; set; }
            public string steamId { get; set; }
            public string productId { get; set; }
            public string itemId { get; set; }
            public int itemQuantity { get; set; }
            public string status { get; set; }
        }
    }
}
